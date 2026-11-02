// Pinned public model revisions. Documents remain in this browser worker.
const LIBRARY='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const models={advanced:{id:'onnx-community/Qwen2.5-1.5B-Instruct',revision:'d54957e3af1be04546436e874a60fe386041b244'},compatible:{id:'onnx-community/Qwen2.5-0.5B-Instruct',revision:'22942cb7d7ba4cc81bb4673549ca4d4614469b5e'}};
let generator=null,library=null,stopping=null,running=false;
const postProgress=(stage,percent,detail='')=>self.postMessage({type:'progress',progress:{stage,percent,detail}});
self.onmessage=async({data})=>{
 if(data.type==='stop'){stopping?.interrupt();return}
 try{
  if(data.type==='load'){
   const selected=models[data.profile||'advanced'];if(!selected)throw Error('El modo de rendimiento no es válido.');
   let adapter=null;try{adapter=await self.navigator.gpu?.requestAdapter()}catch{}
   if(data.profile==='advanced'&&(!adapter||!adapter.features.has('shader-f16')))throw Error('El modo avanzado necesita WebGPU con precisión de 16 bits en una página HTTPS. Este navegador no lo ofrece. Activa el modo compatible para continuar.');
   postProgress('Preparando el motor de Startupia',0);library=await import(LIBRARY);library.env.allowLocalModels=false;library.env.useBrowserCache=typeof caches!=='undefined';library.env.backends.onnx.wasm.numThreads=1;
   const progress_callback=e=>{if(e.status==='progress'&&e.file?.includes('.onnx'))postProgress('Descargando '+(data.profile==='compatible'?'modo compatible':'análisis avanzado'),Math.round(e.progress||0),e.file);else if(e.status==='done'&&e.file?.includes('.onnx'))postProgress('Preparando la inferencia',100)};
   let device=adapter?'webgpu':'wasm';const dtype=data.profile==='advanced'?'q4f16':'q4';
   try{generator=await library.pipeline('text-generation',selected.id,{dtype,device,revision:selected.revision,progress_callback})}catch(error){if(device==='wasm'||data.profile==='advanced')throw error;postProgress('Activando compatibilidad CPU',100);device='wasm';generator=await library.pipeline('text-generation',selected.id,{dtype,device,revision:selected.revision,progress_callback})}
   postProgress(device==='webgpu'?'IA lista con aceleración WebGPU':'IA lista con compatibilidad CPU',100,device);self.postMessage({type:'ready',device,profile:data.profile||'advanced'});return;
  }
  if(data.type==='generate'){
   if(!generator)throw Error('Activa primero el motor de IA.');if(running)throw Error('Ya hay una respuesta en curso.');
   running=true;stopping=new library.InterruptableStoppingCriteria();let streamed='';
   const streamer=new library.TextStreamer(generator.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:chunk=>{streamed+=chunk;self.postMessage({type:'chunk',id:data.id,text:chunk})}});
   const result=await generator(data.messages,{max_new_tokens:Math.max(64,Math.min(1024,Number(data.options?.maxNewTokens)||384)),do_sample:false,repetition_penalty:1.08,streamer,stopping_criteria:stopping});
   const output=result?.[0]?.generated_text;const text=streamed||(Array.isArray(output)?output.at(-1)?.content:output)||'';self.postMessage({type:'complete',id:data.id,text:String(text)});
  }
 }catch(e){self.postMessage({type:'error',id:data.id,message:e?.message?.startsWith('Aborted')?'El navegador no pudo reservar memoria para el motor. Prueba el modo compatible.':e?.message||(typeof e==='string'?e.slice(0,220):typeof e==='number'?'El navegador no pudo reservar memoria para este modelo. Prueba el modo compatible.':'El motor no pudo completar esta operación.')})}
 finally{if(data.type==='generate')running=false}
};
