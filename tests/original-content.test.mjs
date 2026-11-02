import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const baseline=readFileSync('experience/original-landing.html','utf8'),current=readFileSync('experience/landing.html','utf8');
const text=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').split(/<[^>]+>/g).map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
assert.deepEqual(text(current),text(baseline),'The original business text must be retained, in order.');
for(const id of ['inicio-cuestionario','evidencia','recorrido','ecosistema','en-movimiento','plataforma','digital-creator','demo','mentores','planes','preguntas'])assert.ok(current.includes('id="'+id+'"'),id);
assert.ok(current.includes('>17 <small>USD / mes'));assert.ok(current.includes('>37 <small>USD / mes'));assert.doesNotMatch(current,/USD ?9(?:\D|$)/);
const scripts=html=>[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src=')).map(m=>m[2]);
const digest=s=>createHash('sha256').update(s).digest('hex');const retained=new Set(scripts(current).map(digest));
for(const code of scripts(baseline)){if(/STARTUPIA MOTION —|220 context-aware compositions|312 new presets:/.test(code.slice(0,150))||code.trim().startsWith('[{"id":"S14-'))continue;assert.ok(retained.has(digest(code)),'Original functional script altered');}
for(const path of ['public/original-motion-pro.css','public/original-motion-pro.js','public/media/startupia-orbit.mp4','public/media/startupia-orbit-poster.jpg'])assert.ok(existsSync(path),path);
const motion=readFileSync('public/original-motion-pro.js','utf8');assert.doesNotMatch(motion,/scrollTo\(|preventDefault\(/);assert.match(motion,/prefers-reduced-motion/);assert.match(motion,/video\.pause\(\)/);
console.log('Passed: original business text/order, original functional scripts, sections, prices, real film assets, reduced motion and native scrolling preserved.');
