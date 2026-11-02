import {initial,emptyEntry} from '../app/model';
import {onboardingState,mentorRequest,planPrices,stageNames} from '../lib/journey-validation';
type Env={DB?:D1Database;BUCKET?:R2Bucket;STARTUPIA_ADMIN_EMAIL?:string;OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const ownerOf=(request:Request)=>request.headers.get('oai-authenticated-user-id')||(import.meta.env.DEV?'local-preview-owner':null);
const emailOf=(request:Request)=>request.headers.get('oai-authenticated-user-email')||(import.meta.env.DEV?'preview@startupia.test':'');
const adminOf=(r:Request,e:Env)=>!!ownerOf(r)&&!!e.STARTUPIA_ADMIN_EMAIL&&emailOf(r).toLowerCase()===e.STARTUPIA_ADMIN_EMAIL.toLowerCase();
async function body(r:Request){const bytes=await bounded(r,24000);return JSON.parse(new TextDecoder().decode(bytes))}
async function bounded(r:Request,max:number){if(Number(r.headers.get('Content-Length')||0)>max)throw Error('size');const reader=r.body?.getReader();if(!reader)return new Uint8Array();let total=0;const parts:Uint8Array[]=[];try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>max){await reader.cancel();throw Error('size')}parts.push(value)}}finally{reader.releaseLock()}const all=new Uint8Array(total);let off=0;for(const p of parts){all.set(p,off);off+=p.length}return all}
export async function journey(r:Request,e:Env):Promise<Response|null>{
 const u=new URL(r.url),path=u.pathname;
 if(!['/api/account','/api/onboarding','/api/plan-interest','/api/mentors','/api/mentor-requests','/api/admin/requests','/api/admin/mentors','/api/files'].includes(path)&&!path.startsWith('/api/files/'))return null;
 const owner=ownerOf(r),isAdmin=adminOf(r,e),email=emailOf(r);
 if(path==='/api/account'&&r.method==='GET'){
  if(!owner)return json({authenticated:false});
  if(!e.DB)return json({error:'El servicio de datos no está disponible. Inténtalo más tarde.'},503);
  const [onboarding,interest]=await Promise.all([e.DB.prepare('SELECT completed_at FROM journey_onboarding WHERE owner=?').bind(owner).first<any>(),e.DB.prepare('SELECT plan FROM plan_interests WHERE owner=?').bind(owner).first<any>()]);
  return json({authenticated:true,email,isAdmin,onboardingComplete:!!onboarding?.completed_at,selectedPlan:interest?.plan||null,subscription:{status:'not_active',prices:planPrices},ai:{remote:!!(e.OPENAI_API_KEY&&e.OPENAI_MODEL),local:true},files:!!e.BUCKET});
 }
 if(path==='/api/mentors'&&r.method==='GET'){if(!e.DB)return json({error:'No pudimos consultar el catálogo.'},503);const rows=await e.DB.prepare('SELECT id,name,role,bio,specialty FROM mentors WHERE active=1 ORDER BY name').all();return json({mentors:rows.results,rate:197,currency:'USD'})}
 if(!owner)return json({error:'Inicia sesión para continuar.'},401);
 if(!e.DB)return json({error:'El servicio de datos no está disponible.'},503);
 if(!['GET','HEAD'].includes(r.method)&&r.headers.get('Origin')!==u.origin)return json({error:'Origen no autorizado.'},403);
 if(!['GET','HEAD'].includes(r.method)&&!path.startsWith('/api/files/')&&!r.headers.get('Content-Type')?.includes('application/json'))return json({error:'Se requiere JSON.'},415);
 try{
  if(path==='/api/onboarding'){
   if(r.method==='GET'){const row=await e.DB.prepare('SELECT data,version,completed_at FROM journey_onboarding WHERE owner=?').bind(owner).first<any>();return json({state:row?JSON.parse(row.data):null,version:row?.version||0,completed:!!row?.completed_at,email})}
   if(r.method!=='PUT')return json({error:'Método no permitido.'},405);
   const b=await body(r),state=onboardingState(b.state,b.complete===true);if(!state||!Number.isInteger(b.version)||b.version<0)return json({error:'Revisa los datos de tu startup antes de guardar.'},400);
   const now=new Date().toISOString();
   const saved=await e.DB.prepare('INSERT INTO journey_onboarding (owner,data,version,completed_at,updated_at) VALUES (?,?,1,NULL,?) ON CONFLICT(owner) DO UPDATE SET data=excluded.data,version=journey_onboarding.version+1,updated_at=excluded.updated_at,completed_at=NULL WHERE journey_onboarding.version=? RETURNING version').bind(owner,JSON.stringify(state),now,b.version).first<any>();
   if(!saved)return json({error:'Tu progreso cambió en otra pestaña. Recarga antes de continuar.'},409);
   if(b.complete===true){
    const old=await e.DB.prepare('SELECT data,version FROM workspaces WHERE owner=?').bind(owner).first<any>();
    const ws=old?JSON.parse(old.data):structuredClone(initial);
    ws.profile={...ws.profile,name:state.startup,founder:state.founder,idea:state.idea,problem:state.problem,audience:state.audience,model:state.sector,stage:stageNames[state.stage]};
    ws.mvp={...ws.mvp,problem:state.problem,audience:state.audience,solution:state.idea};
    const labels:Record<string,string>={validate:'Validar mi idea',build:'Definir mi MVP',customers:'Conseguir clientes',organize:'Ordenar mi trabajo',decide:'Tomar mejores decisiones',grow:'Medir y crecer'};
    ws.records.goals=ws.records.goals||[];
    for(const g of state.goals)if(!ws.records.goals.some((x:any)=>x.id==='onboarding-'+g))ws.records.goals.push({...emptyEntry(labels[g]),id:'onboarding-'+g,description:'Prioridad elegida durante la configuración de tu startup.',tag:'Prioridad del fundador',target:1});
    if(state.difficulty&&!ws.records.notes?.some((x:any)=>x.id==='onboarding-challenge'))ws.records.notes=[...(ws.records.notes||[]),{...emptyEntry('Mi principal reto'),id:'onboarding-challenge',description:state.difficulty}];
    const result=await e.DB.prepare('INSERT INTO workspaces (owner,data,version,updated_at) VALUES (?,?,1,?) ON CONFLICT(owner) DO UPDATE SET data=excluded.data,version=workspaces.version+1,updated_at=excluded.updated_at WHERE workspaces.version=? RETURNING version').bind(owner,JSON.stringify(ws),now,old?.version||0).first<any>();
    if(!result)return json({error:'El workspace cambió en otra pestaña. Tu progreso se conservó; recarga para finalizar.',version:saved.version},409);
    await e.DB.prepare('UPDATE journey_onboarding SET completed_at=? WHERE owner=? AND version=?').bind(now,owner,saved.version).run();
   }
   return json({version:saved.version,completed:b.complete===true});
  }
  if(path==='/api/plan-interest'&&r.method==='POST'){
   const b=await body(r);if(!['build','growth'].includes(b.plan))return json({error:'Elige Build o Growth.'},400);
   await e.DB.prepare('INSERT INTO plan_interests (owner,plan,updated_at) VALUES (?,?,?) ON CONFLICT(owner) DO UPDATE SET plan=excluded.plan,updated_at=excluded.updated_at').bind(owner,b.plan,new Date().toISOString()).run();
   return json({plan:b.plan,price:planPrices[b.plan as keyof typeof planPrices],status:'interest_saved',charged:false,subscriptionActive:false});
  }
  if(path==='/api/mentor-requests'){
   if(r.method==='GET'){const rows=await e.DB.prepare('SELECT id,data,status,created_at FROM mentor_requests WHERE owner=? ORDER BY created_at DESC LIMIT 30').bind(owner).all<any>();return json({requests:rows.results.map(row=>({...row,data:JSON.parse(row.data)}))})}
   if(r.method==='POST'){
    const b=await body(r),data=mentorRequest(b);if(!data||typeof b.requestId!=='string'||!/^[a-zA-Z0-9-]{20,80}$/.test(b.requestId))return json({error:'Completa el reto, tus datos, horas y disponibilidad.'},400);
    const id=owner+':'+b.requestId;
    const existing=await e.DB.prepare('SELECT id,data,status FROM mentor_requests WHERE id=? AND owner=?').bind(id,owner).first<any>();if(existing)return json({id:b.requestId,status:existing.status,total:JSON.parse(existing.data).total,charged:false});
    const recent=await e.DB.prepare('SELECT count(*) AS count FROM mentor_requests WHERE owner=? AND created_at>?').bind(owner,new Date(Date.now()-86400000).toISOString()).first<any>();if((recent?.count||0)>=5)return json({error:'Ya recibimos tus solicitudes recientes. Puedes revisar su estado en esta página.'},429);
    if(data.mentorId){const mentor=await e.DB.prepare('SELECT id FROM mentors WHERE id=? AND active=1').bind(data.mentorId).first();if(!mentor)return json({error:'Este mentor ya no está disponible. Vuelve a elegir.'},400)}
    await e.DB.prepare('INSERT INTO mentor_requests (id,owner,data,status,created_at) VALUES (?,?,?,\'pending\',?)').bind(id,owner,JSON.stringify(data),new Date().toISOString()).run();
    return json({id:b.requestId,status:'pending',total:data.total,charged:false},201);
   }
  }
  if(path.startsWith('/api/admin/')){
   if(!isAdmin)return json({error:'No tienes acceso a la administración.'},403);
   if(path==='/api/admin/requests'&&r.method==='GET'){const rows=await e.DB.prepare('SELECT id,data,status,created_at FROM mentor_requests ORDER BY created_at DESC LIMIT 100').all<any>();return json({requests:rows.results.map(row=>({...row,data:JSON.parse(row.data)}))})}
   if(path==='/api/admin/requests'&&r.method==='PATCH'){const b=await body(r);if(typeof b.id!=='string'||!['pending','contacted','confirmed','completed','cancelled'].includes(b.status))return json({error:'Estado no válido.'},400);const result=await e.DB.prepare('UPDATE mentor_requests SET status=? WHERE id=? RETURNING id').bind(b.status,b.id).first();return result?json({ok:true}):json({error:'Solicitud no encontrada.'},404)}
   if(path==='/api/admin/mentors'&&r.method==='POST'){const b=await body(r);if(!['name','role','bio','specialty'].every(k=>typeof b[k]==='string'&&b[k].trim().length>=3&&b[k].length<=800)||!['Estrategia y validación','Producto y MVP','Ventas y crecimiento'].includes(b.specialty))return json({error:'Completa nombre, cargo, biografía y especialidad.'},400);const id=crypto.randomUUID();await e.DB.prepare('INSERT INTO mentors (id,name,role,bio,specialty,active) VALUES (?,?,?,?,?,1)').bind(id,b.name.trim(),b.role.trim(),b.bio.trim(),b.specialty).run();return json({id},201)}
  }
  if(path==='/api/files'&&r.method==='GET'){const rows=await e.DB.prepare('SELECT id,name,type,size,created_at FROM stored_files WHERE owner=? ORDER BY created_at DESC LIMIT 100').bind(owner).all<any>();return json({files:rows.results.map(x=>({...x,id:x.id.slice(owner.length+1)}))})}
  if(path.startsWith('/api/files/')){
   if(!e.BUCKET)return json({error:'El almacenamiento de archivos no está disponible.'},503);
   const id=path.slice('/api/files/'.length);if(!/^[a-zA-Z0-9-]{10,80}$/.test(id))return json({error:'Archivo no válido.'},400);const scoped=owner+':'+id;
   if(r.method==='PUT'){
    const name=decodeURIComponent(r.headers.get('X-File-Name')||'').replace(/[\x00-\x1f/\\]/g,'').slice(0,180);
    if(!/\.(pdf|docx|txt|md|csv|tsv|json)$/i.test(name))return json({error:'Formato no admitido.'},400);
    const current=await e.DB.prepare('SELECT id FROM stored_files WHERE id=? AND owner=?').bind(scoped,owner).first();if(current)return json({id,name,stored:true});
    const count=await e.DB.prepare('SELECT count(*) AS count FROM stored_files WHERE owner=?').bind(owner).first<any>();if((count?.count||0)>=100)return json({error:'Llegaste al límite provisional de 100 archivos. Elimina originales que ya no necesites.'},429);
    const bytes=await bounded(r,3*1024*1024);if(!bytes.length)return json({error:'El archivo está vacío.'},400);
    const scope=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner));const prefix=Array.from(new Uint8Array(scope),n=>n.toString(16).padStart(2,'0')).join('');const key=prefix+'/'+id;
    await e.BUCKET.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
    try{await e.DB.prepare('INSERT INTO stored_files (id,owner,name,type,size,object_key,created_at) VALUES (?,?,?,?,?,?,?)').bind(scoped,owner,name,name.split('.').pop()!.toLowerCase(),bytes.length,key,new Date().toISOString()).run()}catch(err){await e.BUCKET.delete(key);throw err}
    return json({id,name,stored:true},201);
   }
   const file=await e.DB.prepare('SELECT * FROM stored_files WHERE id=? AND owner=?').bind(scoped,owner).first<any>();if(!file)return json({error:'Archivo no encontrado.'},404);
   if(r.method==='GET'){const object=await e.BUCKET.get(file.object_key);if(!object)return json({error:'No pudimos recuperar el original.'},404);return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}})}
   if(r.method==='DELETE'){await e.BUCKET.delete(file.object_key);await e.DB.prepare('DELETE FROM stored_files WHERE id=? AND owner=?').bind(scoped,owner).run();return json({deleted:true})}
  }
  return json({error:'Método no permitido.'},405);
 }catch(err:any){if(err.message==='size')return json({error:'El contenido supera el tamaño permitido.'},413);if(err instanceof SyntaxError||err instanceof URIError)return json({error:'Los datos enviados no son válidos.'},400);return json({error:'No pudimos completar la operación. Reintenta sin cerrar tu trabajo.'},500)}
}
