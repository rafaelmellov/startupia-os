import assert from 'node:assert/strict';
import ts from 'typescript';import {readFileSync} from 'node:fs';
const compiled=ts.transpileModule(readFileSync('worker/research.ts','utf8').replaceAll('import.meta.env.DEV','false'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {research}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const req=(query,owner='user',origin='https://startupia.test')=>new Request('https://startupia.test/api/research',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(owner?{'oai-authenticated-user-id':owner}:{})},body:JSON.stringify({query})});
assert.equal((await research(req('startup',''))).status,401);assert.equal((await research(req('startup','user','https://bad.test'))).status,403);assert.equal((await research(req('a'))).status,400);
const saved=globalThis.fetch;let urls=[];
try{
 globalThis.fetch=async url=>{urls.push(url);return Response.json(url.includes('wikipedia')?{query:{search:[{pageid:123,title:'Empresa',snippet:'<b>Dato</b> de prueba'}]}}:{message:{items:[{DOI:'10.1/test',URL:'https://doi.org/10.1/test',title:['Paper'],abstract:'<p>Abstract</p>',publisher:'Test Press'}]}})};
 const r=await research(req('startup validación'));assert.equal(r.status,200);const d=await r.json();assert.equal(d.sources.length,2);assert.equal(d.sources[0].snippet,'Dato de prueba');assert.ok(d.sources.every(s=>s.url.startsWith('https://')));assert.ok(urls.every(u=>u.startsWith('https://es.wikipedia.org/')||u.startsWith('https://api.crossref.org/')));
 globalThis.fetch=async url=>{if(url.includes('wikipedia'))throw Error('down');return Response.json({message:{items:[]}})};const partial=await (await research(req('startup'))).json();assert.deepEqual(partial.unavailable,['Wikipedia']);
 globalThis.fetch=async()=>{throw Error('down')};assert.equal((await research(req('startup'))).status,502);
 console.log('Passed: research authentication, origin, query validation, fixed upstream sources, sanitized snippets, partial-source recovery and source failures.');
}finally{globalThis.fetch=saved}
