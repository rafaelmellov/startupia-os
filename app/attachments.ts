export type Attachment={id:string;name:string;type:string;size:number;text:string;documentId?:string;truncated?:boolean};
const importRemote=(url:string)=>import(/* webpackIgnore: true */ /* @vite-ignore */ url);
export async function readAttachment(file:File):Promise<Omit<Attachment,'id'>>{
 if(!file.name||file.name.length>500)throw Error('El nombre del archivo debe tener entre 1 y 500 caracteres.');
 if(file.size>3*1024*1024)throw Error('Cada archivo puede pesar hasta 3 MB.');
 const ext=file.name.split('.').pop()?.toLowerCase();let text='';
 if(['txt','md','csv','json','tsv'].includes(ext||''))text=await file.text();
 else if(ext==='docx'){
  const {unzipSync,strFromU8}=await importRemote('https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js');
  const files=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:(f:any)=>f.name==='word/document.xml'&&f.originalSize<1500000});
  if(!files['word/document.xml'])throw Error('No fue posible leer el contenido de este documento.');
  const document=new DOMParser().parseFromString(strFromU8(files['word/document.xml']),'application/xml');
  for(const br of Array.from(document.getElementsByTagNameNS('*','br')))br.replaceWith(document.createTextNode('\n'));for(const tab of Array.from(document.getElementsByTagNameNS('*','tab')))tab.replaceWith(document.createTextNode('\t'));
  text=Array.from(document.getElementsByTagNameNS('*','p')).map(p=>p.textContent).join('\n');
 }else if(ext==='pdf'){
  const pdf=await importRemote('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.mjs');
  pdf.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.mjs';
  const document=await pdf.getDocument({data:await file.arrayBuffer(),isEvalSupported:false,disableFontFace:true}).promise;
  try{for(let n=1;n<=Math.min(document.numPages,12);n++){const page=await document.getPage(n);const content=await page.getTextContent();text+=content.items.map((x:any)=>x.str||'').join(' ')+'\n'}}finally{await document.destroy()}
 }else throw Error('Formatos admitidos: PDF con texto, DOCX, TXT, Markdown, CSV, TSV y JSON.');
 text=text.replaceAll('\0','').trim();if(!text)throw Error('No se encontró texto. Los PDF escaneados necesitan reconocimiento de texto previo.');
 return {name:file.name,type:ext||'txt',size:file.size,text:text.slice(0,18000),...(text.length>18000?{truncated:true}:{})};
}

export async function readAttachmentBatch(files:File[],makeId:()=>string,timeoutMs=30000){const results=await Promise.allSettled(files.map(async file=>{let timer:ReturnType<typeof setTimeout>;try{return {...await Promise.race([readAttachment(file),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('La lectura tardó demasiado. Vuelve a intentar con un archivo más pequeño.')),timeoutMs)})]),id:makeId()}}finally{clearTimeout(timer!)}}));const attachments:Attachment[]=[],errors:string[]=[];results.forEach((result,index)=>{if(result.status==='fulfilled')attachments.push(result.value);else errors.push(files[index].name+': '+(result.reason?.message||'No fue posible leer este archivo.'))});return {attachments,errors}}
