import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
// Optional authoring dependency; not loaded by Startupia's application runtime.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{}),args:['--no-first-run','--no-default-browser-check']});
try{const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 await page.addInitScript(()=>{});
 await page.setContent('<html><body></body></html>');await page.evaluate(logo=>window.brandLogo=logo,'data:image/png;base64,'+readFileSync('public/isotipo.png').toString('base64'));
 await page.setContent(readFileSync('creative/brand-film.html','utf8'));await page.evaluate(()=>window.filmReady);
 const format=await page.evaluate(()=>['video/mp4;codecs=avc1.42001E','video/mp4','video/webm;codecs=vp9','video/webm'].find(type=>MediaRecorder.isTypeSupported(type)));if(!format)throw Error('A video encoder is required.');
 mkdirSync('public/media',{recursive:true});await page.evaluate(()=>renderFilm(3));await page.locator('canvas').screenshot({path:'public/media/startupia-orbit-poster.jpg',type:'jpeg',quality:90});
 const encoded=await page.evaluate(async type=>{const canvas=document.querySelector('canvas'),stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:500000}),chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start();const start=performance.now();await new Promise(resolve=>{function frame(now){const t=(now-start)/1000;renderFilm(Math.min(t,8.99));if(t<9)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());const data=new Uint8Array(await new Blob(chunks,{type}).arrayBuffer());let binary='';for(let offset=0;offset<data.length;offset+=32768)binary+=String.fromCharCode(...data.subarray(offset,offset+32768));return btoa(binary)},format);
 const extension=format.includes('mp4')?'mp4':'webm',path=resolve(`public/media/startupia-orbit.${extension}`);writeFileSync(path,Buffer.from(encoded,'base64'));console.log(JSON.stringify({path,format,duration:9,dimensions:[1280,720],audio:false,bytes:Buffer.from(encoded,'base64').length}));
}finally{await browser.close()}
