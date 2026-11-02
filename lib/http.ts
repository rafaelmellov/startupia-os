export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
export function sameOrigin(request:Request){
 if(['GET','HEAD'].includes(request.method))return;
 let origin:URL;try{origin=new URL(request.headers.get('origin')||'')}catch{throw new HttpError(403,'Origen no autorizado.')}
 const expected=process.env.APP_ORIGIN;
 const valid=expected?origin.origin===new URL(expected).origin:origin.host===(request.headers.get('host')||new URL(request.url).host)&&origin.protocol===new URL(request.url).protocol;
 if(!valid)throw new HttpError(403,'Origen no autorizado.');
}
export async function readJson(request:Request,max=950000){
 if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError(415,'Se requiere JSON.');
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Faltan los datos.');
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new HttpError(413,'El contenido supera el límite permitido.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new HttpError(400,'JSON no válido.')}
}
export function safeNext(value:unknown){return typeof value==='string'&&/^\/(os|onboarding|mentors|admin|checkout(?:\/(?:success|canceled))?|reset-password)([?#].*)?$/.test(value)?value:'/os'}
