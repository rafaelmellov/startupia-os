import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {loadTS} from './ts-loader.mjs';
const {api,validWorkspace}=await loadTS('worker/api.ts');
const {initial}=await loadTS('app/model.ts');
const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0000_graceful_skaar.sql','utf8'));
const env={DB:{prepare(sql){return {bind(...values){return {async first(){return db.prepare(sql).get(...values)||null}}}}}}};
function request(path,method='GET',data,owner='owner-a',origin='https://startupia.test'){return new Request('https://startupia.test'+path,{method,headers:{...(owner?{'oai-authenticated-user-id':owner}:{}),Origin:origin,'Content-Type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})})}
const call=(...args)=>api(request(...args),env);
assert.equal(validWorkspace(initial),true);
assert.equal(validWorkspace({...initial,records:{...initial.records,tasks:[{title:'bad'}]}}),false);
assert.equal((await call('/api/workspace','GET',undefined,'')).status,401);
assert.equal((await call('/api/workspace','PUT',{state:initial,version:0},'owner-a','https://attacker.test')).status,403);
assert.equal((await call('/api/workspace','PUT',{state:{bad:true},version:0})).status,400);
const empty=await (await call('/api/workspace')).json();assert.equal(empty.state,null);assert.equal(empty.version,0);assert.match(empty.backupScope,/^[a-f0-9]{64}$/);const other=await (await call('/api/workspace','GET',undefined,'owner-b')).json();assert.notEqual(empty.backupScope,other.backupScope);
let res=await call('/api/workspace','PUT',{state:initial,version:0});assert.equal(res.status,200);assert.equal((await res.json()).version,1);
assert.equal((await call('/api/workspace','PUT',{state:initial,version:0})).status,409);
assert.equal((await (await call('/api/workspace')).json()).state.profile.name,initial.profile.name);
assert.equal((await (await call('/api/workspace','GET',undefined,'owner-b')).json()).state,null);
const updated=structuredClone(initial);updated.profile.name='Updated startup';
res=await call('/api/workspace','PUT',{state:updated,version:1});assert.equal((await res.json()).version,2);
assert.equal((await call('/api/workspace','PUT',{state:initial,version:1})).status,409);
assert.equal((await (await call('/api/workspace')).json()).state.profile.name,'Updated startup');
const s=await (await call('/api/ai/status')).json();assert.equal(s.providers.openai,false);assert.equal(s.usage.used,0);
assert.equal((await call('/api/ai','POST',{provider:'openai',mode:'copilot',question:'Hi',context:initial,history:[]})).status,503);
assert.equal((await call('/api/ai','POST',{provider:'malicious',mode:'copilot',question:'Hi',context:initial})).status,400);
assert.equal((await call('/api/workspace','PUT',{state:{...initial,profile:{...initial.profile,idea:'x'.repeat(960000)}},version:2})).status,413);
const id='owner-a:'+new Date().toISOString().slice(0,10);db.prepare('INSERT INTO ai_usage VALUES (?,20)').run(id);
const limited={...env,OPENAI_API_KEY:'test-key-never-sent',OPENAI_MODEL:'test-model'};
assert.equal((await api(request('/api/ai','POST',{provider:'openai',mode:'copilot',question:'Hi',context:initial}),limited)).status,429);
assert.equal(db.prepare('SELECT used FROM ai_usage WHERE id=?').get(id).used,20);
console.log('Passed: workspace validation, identity, origin protection, isolated persistence, optimistic concurrency, limits, missing providers and oversized requests.');
const realFetch=globalThis.fetch;let upstreamCalls=[];
try{
 for(const provider of ['openai','anthropic','gemini']){
  globalThis.fetch=async(url,options)=>{upstreamCalls.push({url,body:JSON.parse(options.body)});return Response.json(provider==='openai'?{output:[{content:[{type:'output_text',text:'Respuesta de prueba'}]}]}:provider==='anthropic'?{content:[{type:'text',text:'Respuesta de prueba'}]}:{candidates:[{content:{parts:[{text:'Respuesta de prueba'}]}}]})};
  const all={...env,OPENAI_API_KEY:'test',OPENAI_MODEL:'test',ANTHROPIC_API_KEY:'test',ANTHROPIC_MODEL:'test',GEMINI_API_KEY:'test',GEMINI_MODEL:'test'};
  const res=await api(request('/api/ai','POST',{provider,mode:'mvp',question:'Define MVP',context:initial,history:[]},'provider-test-'+provider),all);
  assert.equal(res.status,200);const body=await res.json();assert.equal(body.text,'Respuesta de prueba');assert.equal(body.provider,provider);assert.equal(body.usage.used,1);
 }
 assert.equal(upstreamCalls.length,3);assert.ok(upstreamCalls[0].url.startsWith('https://api.openai.com/'));assert.ok(upstreamCalls[1].body.system.includes('Startupia'));
 globalThis.fetch=async()=>Response.json({secret:'must-not-be-forwarded'},{status:401});
 const res=await api(request('/api/ai','POST',{provider:'openai',mode:'copilot',question:'Hi',context:initial},'failed-provider-test'),{...env,OPENAI_API_KEY:'test',OPENAI_MODEL:'test'});
 assert.equal(res.status,502);assert.equal(JSON.stringify(await res.json()).includes('must-not-be-forwarded'),false);
 console.log('Passed: all three provider adapters with mocked upstream responses and sanitized upstream errors. Live credentials remain untested.');
}finally{globalThis.fetch=realFetch}

assert.equal(validWorkspace({...initial,messages:[{id:'x',role:'assistant',content:'test',sources:'invalid'}]}),false);
assert.equal(validWorkspace({...initial,profile:{name:'Broken',founder:'Test'}}),false);
assert.equal(validWorkspace({...initial,mvp:{problem:123}}),false);
console.log('Passed: incomplete imported profiles and invalid MVP fields are rejected by the shared client/server contract.');

const payload=new TextEncoder().encode('x'.repeat(960000));const stream=new ReadableStream({start(controller){controller.enqueue(payload);controller.close()}});const oversized=new Request('https://startupia.test/api/workspace',{method:'PUT',headers:{Origin:'https://startupia.test','Content-Type':'application/json','oai-authenticated-user-id':'owner-a'},body:stream,duplex:'half'});assert.equal((await api(oversized,env)).status,413);console.log('Passed: streamed oversized payloads are rejected without relying on Content-Length.');
