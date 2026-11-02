import assert from 'node:assert/strict';import ts from 'typescript';import {readFileSync} from 'node:fs';
class FakeWorker extends EventTarget{static instances=[];sent=[];terminated=false;constructor(){super();FakeWorker.instances.push(this)}postMessage(m){this.sent.push(m)}terminate(){this.terminated=true}emit(d){this.dispatchEvent(new MessageEvent('message',{data:d}))}}
const original=globalThis.Worker;globalThis.Worker=FakeWorker;
try{
 const code=ts.transpileModule(readFileSync('app/local-ai.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const engine=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const prep=engine.prepareLocalAI(()=>{});let w=FakeWorker.instances.at(-1);w.emit({type:'ready'});await prep;assert.equal(engine.isLocalAIReady(),true);
 let observed='';let ctrl=new AbortController();let generation=engine.generateLocalAI([{role:'user',content:'Test'}],text=>observed=text,ctrl.signal);let id=w.sent.at(-1).id;w.emit({type:'chunk',id,text:'Respuesta'});w.emit({type:'complete',id,text:'Respuesta'});assert.equal(await generation,'Respuesta');assert.equal(observed,'Respuesta');
 ctrl=new AbortController();generation=engine.generateLocalAI([{role:'user',content:'Stop'}],()=>{},ctrl.signal);id=w.sent.at(-1).id;ctrl.abort();assert.equal(w.sent.at(-1).type,'stop');w.emit({type:'complete',id,text:'Partial'});await assert.rejects(generation,e=>e.name==='AbortError');
 engine.disposeLocalAI();assert.equal(w.terminated,true);assert.equal(engine.isLocalAIReady(),false);
 const canceled=engine.prepareLocalAI(()=>{});w=FakeWorker.instances.at(-1);engine.disposeLocalAI();await assert.rejects(canceled,e=>e.name==='AbortError');
 const retry=engine.prepareLocalAI(()=>{});w=FakeWorker.instances.at(-1);w.emit({type:'ready'});await retry;assert.equal(engine.isLocalAIReady(),true);engine.disposeLocalAI();
 console.log('Passed: local worker readiness, streamed responses, stop acknowledgement, load cancellation and clean retry.');
}finally{globalThis.Worker=original}
// Failure cases must settle promptly instead of leaving the UI busy.
