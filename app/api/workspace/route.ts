import { getDb } from '@/db';
import { workspaces } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { apply, DomainError, emptyState, id, seedState, view, type Employee, type State, type Action } from '@/lib/domain';

export const dynamic = 'force-dynamic';

async function context(request: Request) {
  const demo = request.headers.get('x-payple-demo') === '1';
  const match = request.headers.get('cookie')?.match(/(?:^|;\s*)payple_demo=([a-f0-9-]{36})(?:;|$)/i);
  const token = match?.[1] || id(); const key = demo ? `demo:${token}` : 'live';
  const user = demo ? null : await getChatGPTUser();
  if (!demo && !user) throw new DomainError('Please sign in to open your workspace.', 401);
  const db = getDb();
  let row = await db.select().from(workspaces).where(eq(workspaces.id, key)).get();
  if (!row) {
    // New Sites are owner-private. First authenticated visit establishes its owner.
    const payload = demo ? seedState() : emptyState(user!);
    await db.insert(workspaces).values({ id: key, payload: JSON.stringify(payload), revision: 1, updatedAt: new Date().toISOString() }).onConflictDoNothing();
    row = await db.select().from(workspaces).where(eq(workspaces.id, key)).get();
  }
  if (!row) throw new DomainError('Workspace could not be opened. Please retry.', 503);
  const state: State = JSON.parse(row.payload);
  let actor: Employee | undefined;
  if (demo) {
    const role = request.headers.get('x-payple-role') || 'admin';
    if (!['admin', 'manager', 'photographer'].includes(role)) throw new DomainError('Invalid sample role.');
    actor = state.employees.find(e => e.id === ({ admin: 'admin', manager: 'manager', photographer: 'photo' } as Record<string, string>)[role]);
  } else {
    actor = state.employees.find(e => e.userId === user!.userId || (!e.userId && e.email.toLowerCase() === user!.email.toLowerCase()));
  }
  if (!actor || !actor.active) throw new DomainError('Your account has not been added to this team. Ask the admin to add your sign-in email.', 403);
  return { db, row, state, actor, user, demo, cookie: demo && !match ? `payple_demo=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}` : null };
}
function response(data: unknown, status = 200, cookie: string | null = null) {
  const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  if (cookie) headers.set('set-cookie', cookie);
  return new Response(JSON.stringify(data), { status, headers });
}
function failure(e: unknown) { return e instanceof DomainError ? response({ error: e.message }, e.status) : response({ error: 'The workspace could not complete this request. Please retry.' }, 500); }

export async function GET(request: Request) {
  try {
    const c = await context(request);
    if (c.user && !c.actor.userId) {
      c.actor.userId = c.user.userId;
      const updated = await c.db.update(workspaces).set({ payload: JSON.stringify(c.state), revision: c.row.revision + 1, updatedAt: new Date().toISOString() }).where(and(eq(workspaces.id, c.row.id), eq(workspaces.revision, c.row.revision))).returning({ revision: workspaces.revision });
      if (!updated.length) throw new DomainError('Workspace changed. Please refresh.', 409);
      c.row.revision++;
    }
    return response({ state: view(c.state, c.actor), actor: c.actor, revision: c.row.revision, demo: c.demo }, 200, c.cookie);
  } catch (e) { return failure(e); }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== new URL(request.url).host) throw new DomainError('This request must come from your workspace.', 403);
    if (!request.headers.get('content-type')?.includes('application/json')) throw new DomainError('Expected a JSON request.');
    const raw = await request.text(); if (raw.length > 16000) throw new DomainError('Request is too large.');
    let body: { revision?: unknown; action?: Action }; try { body = JSON.parse(raw); } catch { throw new DomainError('Invalid request.'); }
    if (!body.action || typeof body.action.type !== 'string') throw new DomainError('Choose an action.');
    const c = await context(request);
    if (body.revision !== c.row.revision) throw new DomainError('Someone updated this workspace. Refresh and try again.', 409);
    const state = apply(c.state, c.actor, body.action);
    const result = await c.db.update(workspaces).set({ payload: JSON.stringify(state), revision: c.row.revision + 1, updatedAt: new Date().toISOString() }).where(and(eq(workspaces.id, c.row.id), eq(workspaces.revision, c.row.revision))).returning({ revision: workspaces.revision });
    if (!result.length) throw new DomainError('Workspace changed while saving. Refresh and retry.', 409);
    return response({ state: view(state, c.actor), actor: c.actor, revision: result[0].revision, demo: c.demo }, 200, c.cookie);
  } catch (e) { return failure(e); }
}
