import Workspace from '../workspace-ui';
import { requireChatGPTUser } from '../chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Page() { await requireChatGPTUser('/admin'); return <Workspace demo={false} />; }
