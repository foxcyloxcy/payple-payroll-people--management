export type Role = 'admin' | 'manager' | 'photographer';
export type Branch = { id: string; name: string; location: string; color: string; active: boolean };
export type Employee = { id: string; name: string; email: string; role: Role; branchId: string; active: boolean; userId?: string };
export type Plan = { id: string; employeeId: string; kind: 'basic' | 'minimum' | 'fixed'; dailyMinor: number; commissionBps: number; effectiveFrom: string; scheduleId: string };
export type Schedule = { id: string; name: string; frequency: 'weekly' | 'twice_monthly'; days: number[]; weekday: number };
export type Report = { id: string; branchId: string; date: string; grossMinor: number; discountsMinor: number; refundsMinor: number; originals: number; reprints: number; waste: number; size: string; notes: string; status: 'draft' | 'submitted' | 'approved' | 'returned'; authorId: string; createdAt: string };
export type Attendance = { id: string; employeeId: string; branchId: string; date: string; clockIn: string; clockOut: string | null; status: 'open' | 'pending' | 'approved'; dayUnitsBps: number };
export type Earning = { employeeId: string; employeeName: string; date: string; branchId: string; baseMinor: number; commissionMinor: number; totalMinor: number; planId: string; reportId: string; attendanceId: string };
export type Run = { id: string; start: string; end: string; createdAt: string; status: 'draft' | 'approved'; items: Earning[]; totalMinor: number };
export type Audit = { id: string; actorId: string; message: string; at: string };
export type State = { company: { name: string; salesBasis: 'gross' | 'net'; domain: string }; branches: Branch[]; employees: Employee[]; plans: Plan[]; schedules: Schedule[]; reports: Report[]; attendance: Attendance[]; runs: Run[]; audit: Audit[] };
export class DomainError extends Error { status: number; constructor(message: string, status = 400) { super(message); this.status = status; } }
export const id = () => crypto.randomUUID();
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const money = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(n / 100);
export const sales = (r: Report, basis: 'gross' | 'net' = 'net') => basis === 'gross' ? r.grossMinor : r.grossMinor - r.discountsMinor - r.refundsMinor;
export function validDate(x: unknown): x is string { return typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x + 'T00:00:00Z').toISOString().slice(0, 10) === x; }
function text(x: unknown, label: string, max = 120) { if (typeof x !== 'string' || !x.trim() || x.trim().length > max) throw new DomainError(`${label} is required (maximum ${max} characters).`); return x.trim(); }
function integer(x: unknown, label: string, max = 100_000_000) { if (typeof x !== 'number' || !Number.isSafeInteger(x) || x < 0 || x > max) throw new DomainError(`${label} must be a non-negative whole number, up to ${max}.`); return x; }
function date(x: unknown) { if (!validDate(x)) throw new DomainError('Enter a valid date.'); return x; }
const admin = (a: Employee) => { if (a.role !== 'admin') throw new DomainError('Only an admin can change this.', 403); };
const scope = (a: Employee, branchId: string) => { if (a.role === 'photographer' || (a.role === 'manager' && a.branchId !== branchId)) throw new DomainError('This branch is outside your access.', 403); };
function branch(s: State, key: unknown) { const b = s.branches.find(b => b.id === key && b.active); if (!b) throw new DomainError('Select an active branch.'); return b; }
function employee(s: State, key: unknown) { const e = s.employees.find(e => e.id === key && e.active); if (!e) throw new DomainError('Employee not found.'); return e; }

export function effectivePlan(s: State, employeeId: string, day: string) { return s.plans.filter(p => p.employeeId === employeeId && p.effectiveFrom <= day).reverse().sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]; }
export function earnings(s: State, start: string, end: string): { items: Earning[]; issues: string[] } {
  date(start); date(end); if (end < start || (Date.parse(end) - Date.parse(start)) / 86400000 > 62) throw new DomainError('Choose a period of up to 63 days.');
  const items: Earning[] = [], issues: string[] = [], seen = new Set<string>();
  for (const a of s.attendance.filter(a => a.date >= start && a.date <= end)) {
    const e = s.employees.find(e => e.id === a.employeeId); if (!e || e.role === 'admin') continue;
    if (a.status !== 'approved' || !a.clockOut) { issues.push(`${e.name}: attendance needs review on ${a.date}.`); continue; }
    const key = e.id + a.date; if (seen.has(key)) { issues.push(`${e.name}: multiple branch workdays on ${a.date} need an allocation decision.`); continue; } seen.add(key);
    const p = effectivePlan(s, e.id, a.date); if (!p) { issues.push(`${e.name}: no pay plan effective on ${a.date}.`); continue; }
    const r = s.reports.find(r => r.branchId === a.branchId && r.date === a.date && r.status === 'approved');
    if (!r && p.commissionBps > 0) { issues.push(`${e.name}: approved branch sales are missing on ${a.date}.`); continue; }
    const baseMinor = Math.round(p.dailyMinor * a.dayUnitsBps / 10000), commissionMinor = r ? Math.round(sales(r, s.company.salesBasis) * p.commissionBps / 10000) : 0;
    items.push({ employeeId: e.id, employeeName: e.name, date: a.date, branchId: a.branchId, baseMinor, commissionMinor, totalMinor: baseMinor + commissionMinor, planId: p.id, reportId: r?.id || '', attendanceId: a.id });
  }
  return { items, issues: [...new Set(issues)] };
}

export function calendar(schedule: Schedule, from: string, count = 6): string[] {
  date(from); const out: string[] = []; const d = new Date(from + 'T12:00:00Z');
  for (let i = 0; i < 370 && out.length < count; i++) {
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    const matches = schedule.frequency === 'weekly' ? d.getUTCDay() === schedule.weekday : schedule.days.map(n => Math.min(n, last)).includes(d.getUTCDate());
    if (matches) out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function view(s: State, actor: Employee) {
  if (actor.role === 'admin') return s;
  const branchIds = new Set([actor.branchId]);
  const team = actor.role === 'manager' ? s.employees.filter(e => e.branchId === actor.branchId) : [actor];
  const ids = new Set(team.map(e => e.id));
  return { ...s, branches: s.branches.filter(b => branchIds.has(b.id)), employees: team.map(e => ({ ...e, email: e.id === actor.id ? e.email : '', userId: undefined })), plans: s.plans.filter(p => p.employeeId === actor.id), reports: actor.role === 'manager' ? s.reports.filter(r => branchIds.has(r.branchId)) : [], attendance: s.attendance.filter(a => ids.has(a.employeeId) && (actor.role !== 'manager' || a.branchId === actor.branchId)), runs: s.runs.filter(r => r.status === 'approved').map(r => ({ ...r, items: r.items.filter(i => i.employeeId === actor.id), totalMinor: r.items.filter(i => i.employeeId === actor.id).reduce((t, i) => t + i.totalMinor, 0) })).filter(r => r.items.length), audit: s.audit.filter(a => a.actorId === actor.id) };
}

export type Action = { type: string; [key: string]: unknown };
export function apply(state: State, actor: Employee, action: Action, now = new Date().toISOString()): State {
  if (!actor.active) throw new DomainError('Your account is inactive.', 403);
  const s: State = structuredClone(state); let message = '';
  switch (action.type) {
    case 'branch_save': {
      admin(actor); const name = text(action.name, 'Branch name'), location = text(action.location, 'City / location');
      const b: Branch = { id: id(), name, location, color: ['#2e6757', '#bf8758', '#8d92bb', '#6e9eaa'][s.branches.length % 4], active: true }; s.branches.push(b); message = `Added ${name}`; break;
    }
    case 'employee_save': {
      admin(actor); const b = branch(s, action.branchId), name = text(action.name, 'Name'), email = text(action.email, 'Email').toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new DomainError('Enter a valid email.');
      if (s.employees.some(e => e.email.toLowerCase() === email)) throw new DomainError('This email is already on the team.');
      if (!['manager', 'photographer'].includes(String(action.role))) throw new DomainError('Select manager or photographer.');
      s.employees.push({ id: id(), name, email, branchId: b.id, role: action.role as Role, active: true }); message = `Added ${name} to ${b.name}`; break;
    }
    case 'employee_update': {
      admin(actor); const e = s.employees.find(e => e.id === action.employeeId); if (!e) throw new DomainError('Employee not found.'); if (e.role === 'admin') throw new DomainError('The workspace owner cannot be changed here.');
      const b = branch(s, action.branchId); if (!['manager', 'photographer'].includes(String(action.role))) throw new DomainError('Select a staff role.');
      e.branchId = b.id; e.role = action.role as Role; if (typeof action.active === 'boolean') e.active = action.active;
      message = `Updated ${e.name}'s assignment and access, effective now`; break;
    }
    case 'report_save': {
      const b = branch(s, action.branchId); scope(actor, b.id); const day = date(action.date); if (day > new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now))) throw new DomainError('A report cannot be dated in the future.');
      const grossMinor = integer(action.grossMinor, 'Sales'), discountsMinor = integer(action.discountsMinor, 'Discounts'), refundsMinor = integer(action.refundsMinor, 'Refunds');
      if (discountsMinor + refundsMinor > grossMinor) throw new DomainError('Refunds and discounts exceed sales. This needs a separate adjustment review.');
      const existing = s.reports.find(r => r.branchId === b.id && r.date === day);
      if (existing && !['draft', 'returned'].includes(existing.status)) throw new DomainError('A submitted or approved report already exists for this branch and date.');
      if (existing && actor.role !== 'admin' && existing.authorId !== actor.id) throw new DomainError('Only the author can edit this draft.', 403);
      const r: Report = { id: existing?.id || id(), branchId: b.id, date: day, grossMinor, discountsMinor, refundsMinor, originals: integer(action.originals, 'Original usable copies', 1_000_000), reprints: integer(action.reprints, 'Usable reprints', 1_000_000), waste: integer(action.waste, 'Waste copies', 1_000_000), size: text(action.size, 'Print size', 30), notes: String(action.notes || '').slice(0, 500), status: action.submit === true ? 'submitted' : 'draft', authorId: actor.id, createdAt: existing?.createdAt || now };
      s.reports = [...s.reports.filter(x => x.id !== r.id), r]; message = `${r.status === 'submitted' ? 'Submitted' : 'Saved'} ${b.name} report for ${day}`; break;
    }
    case 'report_review': {
      admin(actor); const r = s.reports.find(r => r.id === action.id); if (!r || r.status !== 'submitted') throw new DomainError('This report is not awaiting review.');
      r.status = action.approve === true ? 'approved' : 'returned'; message = `${r.status === 'approved' ? 'Approved' : 'Returned'} branch report for ${r.date}`; break;
    }
    case 'clock': {
      const open = s.attendance.find(a => a.employeeId === actor.id && !a.clockOut);
      if (action.direction === 'out') { if (!open) throw new DomainError('You are not clocked in.'); open.clockOut = now; open.status = 'pending'; message = 'Clocked out'; }
      else {
        if (open) throw new DomainError('You are already clocked in.');
        const b = branch(s, actor.branchId); const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
        if (s.attendance.some(a => a.employeeId === actor.id && a.date === day)) throw new DomainError('A workday already exists today. Ask your manager to review any correction.');
        s.attendance.push({ id: id(), employeeId: actor.id, branchId: b.id, date: day, clockIn: now, clockOut: null, status: 'open', dayUnitsBps: 10000 }); message = 'Clocked in';
      } break;
    }
    case 'attendance_review': {
      const a = s.attendance.find(a => a.id === action.id); if (!a || !a.clockOut || a.status !== 'pending') throw new DomainError('This workday is not awaiting review.');
      scope(actor, a.branchId); if (a.employeeId === actor.id) throw new DomainError('Another reviewer must approve your workday.', 403);
      a.dayUnitsBps = integer(action.dayUnitsBps ?? 10000, 'Payable day units', 10000); a.status = 'approved'; message = `Approved attendance for ${a.date}`; break;
    }
    case 'plan_save': {
      admin(actor); const e = employee(s, action.employeeId); if (e.role === 'admin') throw new DomainError('Select a manager or photographer.');
      if (!['basic', 'minimum', 'fixed'].includes(String(action.kind))) throw new DomainError('Select a pay arrangement.');
      const effectiveFrom = date(action.effectiveFrom);
      if (effectiveFrom < today()) throw new DomainError('New pay settings must take effect today or later. Historical changes need an adjustment workflow.');
      if (!s.schedules.some(x => x.id === action.scheduleId)) throw new DomainError('Select a payroll schedule.');
      const p: Plan = { id: id(), employeeId: e.id, kind: action.kind as Plan['kind'], dailyMinor: integer(action.dailyMinor, 'Daily base pay'), commissionBps: integer(action.commissionBps, 'Commission percentage', 10000), effectiveFrom, scheduleId: String(action.scheduleId) };
      s.plans.push(p); message = `Published ${e.name}'s pay plan, effective ${effectiveFrom}`; break;
    }
    case 'schedule_save': {
      admin(actor); const name = text(action.name, 'Schedule name'); if (!['weekly', 'twice_monthly'].includes(String(action.frequency))) throw new DomainError('Choose a schedule frequency.');
      const weekday = integer(action.weekday ?? 5, 'Weekday', 6); const days = Array.isArray(action.days) ? action.days.map(d => integer(d, 'Payday', 31)) : [15, 30];
      if (days.length !== 2 || days.some(d => d < 1) || days[0] >= days[1]) throw new DomainError('Choose two different monthly paydays in ascending order.');
      const schedule: Schedule = { id: id(), name, frequency: action.frequency as Schedule['frequency'], days, weekday };
      const dates = calendar(schedule, '2027-01-01', 26); if (dates.some((d, i) => i > 0 && (Date.parse(d) - Date.parse(dates[i - 1])) / 86400000 > 16)) throw new DomainError('This calendar creates payment gaps longer than 16 days. Choose closer dates.');
      s.schedules.push(schedule); message = `Created ${name} payroll schedule`; break;
    }
    case 'company_save': {
      admin(actor); const name = text(action.name, 'Company name'); if (!['gross', 'net'].includes(String(action.salesBasis))) throw new DomainError('Choose a sales basis.');
      if (action.salesBasis !== s.company.salesBasis && s.reports.length) throw new DomainError('A sales-basis change needs a versioned migration once reports exist. Current basis is preserved.');
      const domain = String(action.domain || '').trim().toLowerCase(); if (domain && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) throw new DomainError('Enter a domain without https or a path.');
      s.company = { name, salesBasis: action.salesBasis as 'gross' | 'net', domain }; message = 'Updated workspace settings'; break;
    }
    case 'payroll_draft': {
      admin(actor); const start = date(action.start), end = date(action.end); const result = earnings(s, start, end);
      if (result.issues.length) throw new DomainError(result.issues.slice(0, 3).join(' ')); if (!result.items.length) throw new DomainError('No approved payable workdays in this period.');
      if (s.runs.some(r => r.status === 'approved' && r.start <= end && r.end >= start)) throw new DomainError('This period overlaps approved earnings. Use a new period to avoid duplicate pay.');
      const run: Run = { id: id(), start, end, createdAt: now, status: 'draft', items: result.items, totalMinor: result.items.reduce((t, i) => t + i.totalMinor, 0) };
      s.runs.push(run); message = `Prepared gross earnings for ${start} – ${end}`; break;
    }
    case 'payroll_approve': {
      admin(actor); const r = s.runs.find(r => r.id === action.id); if (!r || r.status !== 'draft') throw new DomainError('This draft is not available.');
      if (s.runs.some(x => x.id !== r.id && x.status === 'approved' && x.start <= r.end && x.end >= r.start)) throw new DomainError('This period overlaps approved earnings.');
      const calculated = earnings(s, r.start, r.end); if (calculated.issues.length || JSON.stringify(calculated.items) !== JSON.stringify(r.items)) throw new DomainError('Source records changed. Generate a fresh draft before approval.');
      r.status = 'approved'; message = `Locked gross earnings for ${r.start} – ${r.end}`; break;
    }
    default: throw new DomainError('Unknown action.');
  }
  s.audit.unshift({ id: id(), actorId: actor.id, message, at: now });
  if (s.reports.length > 1500 || s.audit.length > 5000) throw new DomainError('Workspace capacity reached. Export records and contact the administrator.');
  return s;
}

export function emptyState(owner: { userId: string; email: string; displayName: string }): State {
  return { company: { name: 'My photography team', salesBasis: 'net', domain: '' }, branches: [], employees: [{ id: id(), name: owner.displayName, email: owner.email, userId: owner.userId, role: 'admin', branchId: '', active: true }], plans: [], schedules: [{ id: 's1', name: '15th & 30th', frequency: 'twice_monthly', days: [15, 30], weekday: 5 }, { id: 's2', name: '5th & 20th', frequency: 'twice_monthly', days: [5, 20], weekday: 5 }, { id: 's3', name: 'Weekly · Friday', frequency: 'weekly', days: [15, 30], weekday: 5 }], reports: [], attendance: [], runs: [], audit: [] };
}

export function seedState(day = today()): State {
  const s = emptyState({ userId: 'demo-admin', email: 'alex@example.test', displayName: 'Alex Rivera' }); s.company.name = 'Payple Studio'; s.employees[0].id = 'admin';
  s.branches = [{ id: 'b1', name: 'Makati Studio', location: 'Makati City', color: '#2e6757', active: true }, { id: 'b2', name: 'BGC Booth', location: 'Taguig City', color: '#bf8758', active: true }, { id: 'b3', name: 'Quezon Studio', location: 'Quezon City', color: '#8d92bb', active: true }, { id: 'b4', name: 'Alabang Booth', location: 'Muntinlupa City', color: '#6e9eaa', active: true }];
  s.employees.push({ id: 'manager', name: 'Maya Santos', email: 'maya@example.test', role: 'manager', branchId: 'b1', active: true }, { id: 'photo', name: 'Eli Cruz', email: 'eli@example.test', role: 'photographer', branchId: 'b1', active: true }, { id: 'e3', name: 'Nina Garcia', email: 'nina@example.test', role: 'photographer', branchId: 'b2', active: true }, { id: 'e4', name: 'Jules Reyes', email: 'jules@example.test', role: 'manager', branchId: 'b3', active: true }, { id: 'e5', name: 'Kai Mendoza', email: 'kai@example.test', role: 'photographer', branchId: 'b4', active: true });
  for (const [i, e] of s.employees.filter(e => e.role !== 'admin').entries()) s.plans.push({ id: `p${i}`, employeeId: e.id, kind: i % 2 ? 'minimum' : 'basic', dailyMinor: 65000 + i * 2000, commissionBps: e.role === 'manager' ? 300 : 500, effectiveFrom: '2020-01-01', scheduleId: i % 2 ? 's2' : 's1' });
  for (let back = 29; back >= 0; back--) {
    const dt = new Date(day + 'T12:00:00Z'); dt.setUTCDate(dt.getUTCDate() - back); const date = dt.toISOString().slice(0, 10);
    for (const [bi, b] of s.branches.entries()) {
      const units = back === 2 && bi === 0 ? 12 : 76 + ((back * 17 + bi * 31) % 120), status = back === 0 ? 'submitted' : 'approved';
      s.reports.push({ id: `r${back}-${bi}`, branchId: b.id, date, grossMinor: units * 5500, discountsMinor: 0, refundsMinor: 0, originals: units - 4, reprints: 4, waste: 3 + back % 4, size: ['4R', '5R', '6R'][bi % 3], notes: '', status, authorId: 'manager', createdAt: date + 'T09:00:00Z' });
    }
    if (back > 0) for (const e of s.employees.filter(e => e.role !== 'admin')) s.attendance.push({ id: `a${back}-${e.id}`, employeeId: e.id, branchId: e.branchId, date, clockIn: date + 'T01:00:00Z', clockOut: date + 'T10:00:00Z', status: 'approved', dayUnitsBps: 10000 });
  }
  s.audit = [{ id: id(), actorId: 'admin', message: 'Sample workspace is ready to explore', at: day + 'T01:00:00Z' }]; return s;
}
