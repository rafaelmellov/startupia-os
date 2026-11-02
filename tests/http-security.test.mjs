import assert from 'node:assert/strict';
import {loadTS} from './ts-loader.mjs';
const {sameOrigin,readJson,safeNext}=await loadTS('lib/http.ts');
assert.doesNotThrow(()=>sameOrigin(new Request('http://localhost:3000/api/workspace',{method:'POST',headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})));
assert.throws(()=>sameOrigin(new Request('https://startupia.test/api/workspace',{method:'POST',headers:{host:'startupia.test',origin:'https://evil.test'}})));
assert.throws(()=>sameOrigin(new Request('https://startupia.test/api/workspace',{method:'POST'})));
assert.equal(safeNext('//evil.test'),'/os');assert.equal(safeNext('/\\evil.test'),'/os');assert.equal(safeNext('/onboarding'),'/onboarding');
assert.deepEqual(await readJson(new Request('https://startupia.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"hello":true}'})),{hello:true});
await assert.rejects(readJson(new Request('https://startupia.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"huge":"'+ 'x'.repeat(100)+'"}'}),20),e=>e.status===413);
console.log('Passed: same-origin checks behind local Next host normalization, CSRF denial, redirect allowlist and streamed body limits.');

assert.equal(safeNext('/checkout/success'),'/checkout/success');
assert.equal(safeNext('/checkout/canceled'),'/checkout/canceled');
assert.equal(safeNext('/checkout/../evil'),'/os');
