import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:3000';
if(!process.env.TEST_EMAIL||!process.env.TEST_PASSWORD)throw Error('Set TEST_EMAIL and TEST_PASSWORD for a disposable QA account.');let cookie='';let checks=[];
async function req(path,method='GET',data,headers={}){const r=await fetch(base+path,{method,signal:AbortSignal.timeout(25000),headers:{Origin:base,Cookie:cookie,...headers},body:data});if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');console.log(method,path,r.status);return r;}
let r=await req('/api/auth/login','POST',JSON.stringify({email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD}),{'Content-Type':'application/json'});assert.equal(r.status,200);
const account=await(await req('/api/account')).json();assert.equal(account.entitlements.build,true,'Use a disposable fixture with a verified paid period for upload/download tests.');
const id=randomUUID();r=await req('/api/files/'+id,'PUT','Contenido de prueba privado',{'x-file-name':'prueba.txt'});assert.equal(r.status,201);r=await req('/api/files/'+id);assert.equal(await r.text(),'Contenido de prueba privado');checks.push('Private storage upload/download matches bytes');
r=await fetch(base+'/api/files/'+id);assert.equal(r.status,401);checks.push('Unauthenticated download denied');
r=await req('/api/files/'+id,'DELETE');assert.equal(r.status,200);r=await req('/api/files/'+id);assert.equal(r.status,404);checks.push('File delete removes accessible object and metadata');
const body=JSON.stringify({requestId:randomUUID(),name:'Prueba Startupia',email:process.env.TEST_EMAIL,hours:2,challenge:'Necesito validar una idea de pedidos para pequeños restaurantes.',availability:'Lunes por la tarde',specialty:'Estrategia y validación'});
r=await req('/api/mentor-requests','POST',body,{'Content-Type':'application/json'});assert.equal(r.status,201);const first=await r.json();assert.equal(first.total,394);assert.equal(first.charged,false);
r=await req('/api/mentor-requests','POST',body,{'Content-Type':'application/json'});assert.equal(r.status,200);assert.equal((await r.json()).id,first.id);checks.push('Mentor request persisted; replay idempotent; no charge');
await req('/api/auth/logout','POST');console.log(JSON.stringify({passed:checks},null,2));
