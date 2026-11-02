import assert from 'node:assert/strict';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:3000';
if(!process.env.TEST_EMAIL||!process.env.TEST_PASSWORD)throw Error('Set TEST_EMAIL and TEST_PASSWORD for a disposable QA account.');
const cookies=new Map(),checks=[];
async function call(path,method='GET',body,extra={}){
 const r=await fetch(base+path,{method,signal:AbortSignal.timeout(25000),headers:{Origin:base,Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; '),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
 for(const value of r.headers.getSetCookie()){const part=value.split(';')[0],index=part.indexOf('=');cookies.set(part.slice(0,index),part.slice(index+1))}
 const data=await r.json();console.log(method,path,r.status);return {status:r.status,data};
}
let r=await call('/api/workspace','GET',undefined,{'oai-user-id':'forged'});assert.equal(r.status,401);checks.push('Forged identity headers denied');
r=await call('/api/auth/login','POST',{email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD});assert.equal(r.status,200);checks.push('Real password login');
const account=(await call('/api/account')).data;assert.equal(account.authenticated,true);
if(account.entitlements.build){
 assert.equal(account.onboardingComplete,true,'Complete onboarding for the paid fixture before this test');
 r=await call('/api/workspace');assert.equal(r.status,200);assert.ok(r.data.state.profile.name);checks.push('Paid workspace persisted in database');
 const {state,version}=r.data;
 r=await call('/api/workspace','PUT',{state,version});assert.equal(r.status,200);
 r=await call('/api/workspace','PUT',{state,version});assert.equal(r.status,409);checks.push('Concurrent stale writes rejected');
}else{
 r=await call('/api/workspace');assert.equal(r.status,402);
 r=await call('/api/workspace','PUT',{});assert.equal(r.status,402);
 r=await call('/api/ai','POST',{mode:'copilot',question:'Access-control fixture'});assert.equal(r.status,402);
 checks.push('Unpaid workspace read/write and AI denied');
}
r=await call('/api/plan-interest','POST',{plan:'growth'});assert.equal(r.data.charged,false);
const after=(await call('/api/account')).data;assert.equal(after.entitlements.build,account.entitlements.build);assert.equal(after.entitlements.growth,account.entitlements.growth);checks.push('Commercial selection cannot change entitlements');
r=await call('/api/growth');assert.equal(r.status,account.entitlements.growth?200:account.entitlements.build?403:402);checks.push('Growth access follows verified plan');
if(!account.isAdmin){r=await call('/api/admin/requests');assert.equal(r.status,403);checks.push('Non-admin denied')}
// Never spend provider credits as an incidental live smoke check.
if(account.entitlements.build&&!account.ai.configured){r=await call('/api/ai','POST',{mode:'copilot',question:'Access-control fixture'});assert.equal(r.status,503);checks.push('Missing AI credentials never simulate success')}
r=await call('/api/plan-interest','POST',{plan:'build'},{Origin:'https://evil.test'});assert.equal(r.status,403);checks.push('Cross-origin mutation denied');
await call('/api/auth/logout','POST');r=await call('/api/workspace');assert.equal(r.status,401);checks.push('Logout clears access');
console.log(JSON.stringify({paidFixture:account.entitlements.build,passed:checks},null,2));
