import { chatGPTSignInPath, getChatGPTUser } from '../chatgpt-auth';
import { Aperture, ArrowUpRight, ArrowLeft, ShieldCheck } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getChatGPTUser();
  return <main className="login-page"><a className="brand" href="/"><Aperture size={30} /> payple<span>®</span></a><section className="login-card"><span className="eyebrow">A LITTLE LESS ADMIN</span><h1>Welcome back.<br /><i>Let’s make it a good day.</i></h1><p>Open your team’s workspace with your verified account. Your assigned role takes you to the right place.</p><a className="button primary full" href={user ? '/workspace' : chatGPTSignInPath('/workspace')} target="_top">{user ? 'Open my workspace' : 'Continue with ChatGPT'}<ArrowUpRight size={18} /></a><a className="button secondary full" href="/demo">Explore the sample workspace</a><div className="login-note"><ShieldCheck size={18} /><span>Your admin assigns access. There is no role selection for live accounts.</span></div></section><a className="back-link" href="/"><ArrowLeft size={16} /> Back to Payple</a></main>;
}
