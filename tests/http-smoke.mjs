// Integration checks against an explicitly selected local development server.
// Uses only an isolated synthetic demo workspace; never sends identity headers.
import assert from 'node:assert/strict';
const base=process.env.PAYPLE_TEST_URL || 'http://127.0.0.1:4173';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('HTTP smoke tests are restricted to a local preview.');
let cookie='';let passed=0;
async function call(role='admin',action=null,revision=null,origin=base,demo=true){const headers={'x-payple-demo':demo?'1':'0','x-payple-role':role};if(cookie)headers.cookie=cookie;if(action){headers['content-type']='application/json';headers.origin=origin;}const r=await fetch(base+'/api/workspace',{method:action?'POST':'GET',headers,body:action?JSON.stringify({action,revision}):undefined});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:r.status,data:await r.json()};}
let r=await call('admin',null,null,base,false);assert.equal(r.status,401);passed++;
r=await call();assert.equal(r.status,200);assert.equal(r.data.actor.role,'admin');assert.equal(r.data.state.branches.length,4);const rev=r.data.revision;passed++;
r=await call('photographer');assert.equal(r.status,200);assert.equal(r.data.state.employees.length,1);assert.equal(r.data.state.reports.length,0);assert.ok(r.data.state.plans.every(p=>p.employeeId==='photo'));passed++;
r=await call('photographer',{type:'branch_save',name:'Forbidden',location:'QA'},rev);assert.equal(r.status,403);passed++;
r=await call('admin',{type:'branch_save',name:'CSRF',location:'QA'},rev,'https://elsewhere.example');assert.equal(r.status,403);passed++;
r=await call('admin',{type:'branch_save',name:'QA isolated branch',location:'Synthetic'},rev);assert.equal(r.status,200);assert.equal(r.data.revision,rev+1);passed++;
r=await call('admin',{type:'branch_save',name:'Stale write',location:'QA'},rev);assert.equal(r.status,409);passed++;
r=await call();assert.equal(r.data.state.branches.length,5);assert.equal(r.data.state.branches.at(-1).name,'QA isolated branch');passed++;
r=await call('manager');assert.equal(r.data.state.branches.length,1);assert.ok(r.data.state.reports.every(x=>x.branchId==='b1'));passed++;
console.log(JSON.stringify({http_checks_passed:passed,database_persistence:true,stale_write_rejected:true,live_anonymous_access_rejected:true}));
