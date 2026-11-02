export type LocalProgress={stage:string;percent:number;detail?:string};
export type LocalMessage={role:'system'|'user'|'assistant';content:string};
export type LocalProfile='advanced'|'compatible';
export const localProfiles={advanced:{name:'Análisis avanzado',model:'Qwen2.5 1.5B',download:'1,2 GB',description:'Más capacidad para seguir instrucciones y desarrollar análisis. Requiere WebGPU con precisión de 16 bits y más memoria.'},compatible:{name:'Modo compatible',model:'Qwen2.5 0.5B',download:'800 MB',description:'Menor consumo de memoria. Adecuado para borradores y consultas concretas.'}};
let worker:Worker|null=null,prepared=false,profile:LocalProfile='advanced',device='';
let loadPromise:Promise<void>|null=null,cancelLoad:(()=>void)|null=null,cancelGeneration:((reason:Error)=>void)|null=null,counter=0,generating=false;
export const isLocalAIReady=()=>prepared;
export const localAIInfo=()=>({profile,device,model:localProfiles[profile].model});
export async function prepareLocalAI(onProgress:(p:LocalProgress)=>void,selected:LocalProfile='advanced'):Promise<void>{
 if(prepared&&profile===selected)return;if(loadPromise&&profile===selected)return loadPromise;if(worker)disposeLocalAI();profile=selected;
 loadPromise=new Promise<void>((resolve,reject)=>{
  if(typeof Worker==='undefined'||typeof WebAssembly==='undefined'){reject(Error('Este navegador no admite el motor local. Utiliza una versión reciente de Chrome, Edge o Firefox.'));return}
  const current=new Worker('/local-ai-worker.mjs?v=20261025-intelligence-4',{type:'module'});worker=current;current.addEventListener('error',()=>{if(worker===current){prepared=false;loadPromise=null}});let finished=false;
  const finish=(error?:Error)=>{if(finished)return;finished=true;clearTimeout(timer);current.removeEventListener('message',receive);current.removeEventListener('error',failed);cancelLoad=null;if(error){current.terminate();if(worker===current)worker=null;prepared=false;reject(error)}else{prepared=true;resolve()}};
  const receive=(event:MessageEvent)=>{const d=event.data;if(d.type==='progress')onProgress(d.progress);if(d.type==='ready'){if(d.profile&&d.profile!==selected){finish(Error('El motor cargado no coincide con el modo elegido. Recarga esta página.'));return}device=d.device||'wasm';finish()}if(d.type==='error')finish(Error(d.message||'No se pudo iniciar la IA local.'))};
  const failed=()=>finish(Error('El motor local no pudo cargarse. Comprueba la conexión y prueba el modo compatible.'));
  const timer=setTimeout(()=>finish(Error('La descarga no pudo completarse. Comprueba tu conexión y vuelve a intentarlo.')),15*60*1000);
  cancelLoad=()=>finish(new DOMException('Carga cancelada','AbortError'));
  current.addEventListener('message',receive);current.addEventListener('error',failed);current.postMessage({type:'load',profile:selected});
 }).catch(e=>{loadPromise=null;throw e});return loadPromise!;
}
export async function generateLocalAI(messages:LocalMessage[],onChunk:(text:string)=>void,signal:AbortSignal,options:{maxNewTokens?:number;timeoutMs?:number}={}):Promise<string>{
 if(!worker||!prepared)throw Error('Activa primero la IA en este dispositivo.');if(generating)throw Error('Ya hay una respuesta en curso. Detén la anterior antes de continuar.');if(signal.aborted)throw new DOMException('Generación detenida','AbortError');const current=worker,id=++counter;generating=true;
 return new Promise((resolve,reject)=>{let text='',settled=false;
 const cleanup=()=>{clearTimeout(watchdog);current.removeEventListener('message',receive);current.removeEventListener('error',failed);signal.removeEventListener('abort',abort);cancelGeneration=null;generating=false};
 const finish=(error?:Error,value?:string)=>{if(settled)return;settled=true;cleanup();error?reject(error):resolve(value||text)};
 const destroy=()=>{current.terminate();if(worker===current){worker=null;prepared=false;loadPromise=null}};
 const abort=()=>{current.postMessage({type:'stop',id});destroy();finish(new DOMException('Generación detenida','AbortError'))};
 const receive=(event:MessageEvent)=>{const d=event.data;if(d.id!==id)return;if(d.type==='complete'||d.type==='error'){if(settled){current.removeEventListener('message',receive);return}}if(d.type==='chunk'&&!signal.aborted){text+=String(d.text||'');onChunk(text)}if(d.type==='complete')finish(undefined,d.text||text);if(d.type==='error'){destroy();finish(Error(d.message||'El modelo no pudo completar la respuesta.'))}};
 const failed=()=>{destroy();finish(Error('El motor se interrumpió. Tu borrador se conserva; vuelve a activar la IA para reintentar.'))};
 const watchdog=setTimeout(()=>{destroy();finish(Error('El motor superó el tiempo de generación. Tu borrador se conserva. Prueba una consulta más breve o el modo compatible.'))},options.timeoutMs||5*60*1000);
 cancelGeneration=(reason)=>{destroy();finish(reason)};current.addEventListener('message',receive);current.addEventListener('error',failed);signal.addEventListener('abort',abort,{once:true});try{current.postMessage({type:'generate',id,messages,options:{maxNewTokens:options.maxNewTokens}})}catch{failed()}
 });
}
export function disposeLocalAI(){cancelGeneration?.(new DOMException('Motor detenido','AbortError'));cancelGeneration=null;cancelLoad?.();cancelLoad=null;worker?.terminate();worker=null;prepared=false;loadPromise=null;generating=false}
