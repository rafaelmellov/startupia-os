import {deriveEntitlements} from '../../../lib/entitlements';
import {configuredModel} from '../../../lib/ai/core';
import {workspaceFromOnboarding} from '../../../lib/onboarding-workspace';
import {billingConfigured} from '../../../lib/billing/server';
import {createHash,randomUUID} from 'node:crypto';
import {identity} from '../../../lib/supabase/server';
import {json,HttpError,readJson,sameOrigin} from '../../../lib/http';
import {validWorkspace} from '../../../lib/workspace-validation';
import {onboardingState,mentorRequest,planPrices} from '../../../lib/journey-validation';
import {reportPackage} from '../../../lib/report-package';
import {validReports} from '../../../lib/report-validation';
import {research} from '../../../lib/research';

export const runtime='nodejs';
export const dynamic='force-dynamic';
type Db=Awaited<ReturnType<typeof identity>>['db'];
function checked<T extends {error:any}>(r:T):T{if(r.error)throw new HttpError(['40001','PT409'].includes(r.error.code)?409:r.error.code==='PT402'?402:r.error.code==='42501'?403:503,['40001','PT409'].includes(r.error.code)?'Otra sesión guardó cambios. Recarga antes de continuar.':r.error.code==='PT402'?'Completa un pago válido para activar Startupia OS.':r.error.code==='42501'?'No tienes permiso para esta operación.':'No se pudo completar el guardado. Inténtalo de nuevo.');return r}
async function organization(db:Db,userId:string){
 const own=checked(await db.from('organizations').select('id,name').eq('owner_id',userId).maybeSingle()).data;
 if(own)return own;
 const created=await db.from('organizations').insert({owner_id:userId}).select('id,name').single();
 if(created.error?.code==='23505')return checked(await db.from('organizations').select('id,name').eq('owner_id',userId).single()).data!;
 return checked(created).data!;
}
async function workspace(db:Db,org:string,initialize=false){
 const row=checked(await db.from('workspaces').select('state,version').eq('organization_id',org).maybeSingle()).data;
 if(row||!initialize)return row;
 const progress=checked(await db.from('onboardings').select('state,completed_at').eq('organization_id',org).maybeSingle()).data;
 const context=progress?.completed_at?onboardingState(progress.state,true):null;
 if(!context)throw new HttpError(409,'Completa el contexto inicial de tu startup antes de entrar.');
 const state=workspaceFromOnboarding(context);if(!validWorkspace(state))throw new HttpError(400,'Revisa el contexto inicial de tu startup.');
 const saved=await db.rpc('save_workspace',{org,p_state:state,expected_version:0});
 if(saved.error&&['40001','PT409'].includes(saved.error.code))return checked(await db.from('workspaces').select('state,version').eq('organization_id',org).single()).data;
 checked(saved);return {state,version:saved.data};
}

async function handle(r:Request){
 try{
  sameOrigin(r);const path=new URL(r.url).pathname;const {db,user}=await identity();
  if(path==='/api/health'&&r.method==='GET')return json({status:'ok',service:'startupia-os',version:'0.2.0'});
  if(path==='/api/mentors'&&r.method==='GET')return json({mentors:checked(await db.from('mentors').select('id,name,role,bio,specialty').eq('active',true).order('name')).data,rate:197,currency:'USD'});
  if(!user){if(path==='/api/account'&&r.method==='GET')return json({authenticated:false});throw new HttpError(401,'Inicia sesión para continuar.')}
  const org=await organization(db,user.id),orgId=org.id;
  const isAdmin=user.app_metadata?.startupia_admin===true;
  const subscription=checked(await db.from('subscriptions').select('plan,status,provider,provider_subscription_id,valid_until,payment_verified_until').eq('organization_id',orgId).maybeSingle()).data;
  const entitlements=deriveEntitlements(subscription),active=entitlements.build,growth=entitlements.growth;
  if(path==='/api/account'&&r.method==='GET'){
   const [onboarding,interest]=await Promise.all([db.from('onboardings').select('completed_at').eq('organization_id',orgId).maybeSingle(),db.from('plan_interests').select('plan').eq('organization_id',orgId).maybeSingle()]);checked(onboarding);checked(interest);
   const aiConfigured=!!configuredModel(process.env,entitlements.plan||(interest.data?.plan==='growth'?'growth':'build'));
   return json({authenticated:true,email:user.email,isAdmin,organization:org,onboardingComplete:!!onboarding.data?.completed_at,selectedPlan:interest.data?.plan||null,subscription:{status:active?subscription!.status:'not_active',plan:active?subscription!.plan:null,prices:planPrices},entitlements,ai:{remote:active&&aiConfigured,configured:aiConfigured,local:active},files:active,billing:{configured:billingConfigured()}});
  }
  const paidTool=/^\/api\/(workspace|research|reports|growth|integrations)(?:\/|$)/.test(path)||path.startsWith('/api/files/');
  if(paidTool&&!active)throw new HttpError(402,'Elige un plan y completa un pago válido para activar Startupia OS. Tu información guardada se conserva.');
  if(path==='/api/research')return (await research(r))||json({error:'Ruta no encontrada.'},404);
  if(path==='/api/workspace'){
   if(r.method==='GET'){const row=await workspace(db,orgId,true);return json({state:row?.state||null,version:row?.version||0,backupScope:createHash('sha256').update(orgId+':'+user.id).digest('hex')})}
   if(r.method==='PUT'){
    const b=await readJson(r);if(!validWorkspace(b.state)||!Number.isInteger(b.version)||b.version<0)throw new HttpError(400,'El espacio contiene datos no válidos.');
    const saved=checked(await db.rpc('save_workspace',{org:orgId,p_state:b.state,expected_version:b.version}));return json({version:saved.data});
   }
  }
  if(path==='/api/onboarding'){
   if(r.method==='GET'){const row=checked(await db.from('onboardings').select('state,version,completed_at').eq('organization_id',orgId).maybeSingle()).data;return json({state:row?.state||null,version:row?.version||0,completed:!!row?.completed_at,email:user.email})}
   if(r.method==='PUT'){
    const b=await readJson(r,24000),state=onboardingState(b.state,b.complete===true);if(!state||!Number.isInteger(b.version)||b.version<0)throw new HttpError(400,'Revisa los datos de tu startup.');
    let ws=null,wsVersion=0;
    if(b.complete===true&&active){const row=await workspace(db,orgId);ws=workspaceFromOnboarding(state,row?.state);wsVersion=row?.version||0;if(!validWorkspace(ws))throw new HttpError(400,'El contexto no puede guardarse. Revisa los campos.');}
    const saved=checked(await db.rpc('save_onboarding',{org:orgId,p_state:state,expected_version:b.version,p_workspace:ws,workspace_version:wsVersion}));return json({version:saved.data,completed:b.complete===true});
   }
  }
  if(path==='/api/plan-interest'&&r.method==='POST'){
   const b=await readJson(r,1000);if(!['build','growth'].includes(b.plan))throw new HttpError(400,'Elige Build o Growth.');checked(await db.from('plan_interests').upsert({organization_id:orgId,plan:b.plan}));return json({plan:b.plan,price:planPrices[b.plan as keyof typeof planPrices],charged:false,subscriptionActive:active});
  }
  if(path==='/api/mentor-requests'){
   if(r.method==='GET')return json({requests:checked(await db.from('mentor_requests').select('id,data,status,created_at').eq('organization_id',orgId).order('created_at',{ascending:false}).limit(30)).data});
   if(r.method==='POST'){
    const b=await readJson(r,6000),data=mentorRequest(b);if(!data||typeof b.requestId!=='string'||!/^[a-zA-Z0-9-]{20,80}$/.test(b.requestId))throw new HttpError(400,'Completa tus datos, reto y disponibilidad.');
    const previous=checked(await db.from('mentor_requests').select('id,data,status').eq('organization_id',orgId).eq('request_id',b.requestId).maybeSingle()).data;if(previous)return json({id:previous.id,total:previous.data.total,status:previous.status,charged:false});
    if(data.mentorId){const mentor=checked(await db.from('mentors').select('id').eq('id',data.mentorId).eq('active',true).maybeSingle()).data;if(!mentor)throw new HttpError(400,'El mentor ya no está disponible.');}
    const added=await db.rpc('request_mentor',{org:orgId,p_request_id:b.requestId,p_data:data,p_mentor:data.mentorId||null});
    if(added.error?.message?.includes('Request limit'))throw new HttpError(429,'Ya recibimos tus solicitudes recientes. Revisa su estado.');checked(added);return json({id:added.data,status:'pending',total:data.total,charged:false},201);
   }
  }
  if(path.startsWith('/api/admin/')){
   if(!isAdmin)throw new HttpError(403,'Esta función requiere administración autorizada.');
   if(path==='/api/admin/requests'&&r.method==='GET')return json({requests:checked(await db.from('mentor_requests').select('id,data,status,created_at').order('created_at',{ascending:false}).limit(100)).data});
   if(path==='/api/admin/requests'&&r.method==='PATCH'){const b=await readJson(r,2000);if(!['pending','contacted','confirmed','completed','canceled'].includes(b.status))throw new HttpError(400,'Estado no válido.');checked(await db.from('mentor_requests').update({status:b.status}).eq('id',b.id));return json({ok:true})}
   if(path==='/api/admin/mentors'&&r.method==='POST'){const b=await readJson(r,5000);const data={name:b.name,role:b.role,bio:b.bio,specialty:b.specialty};const saved=checked(await db.from('mentors').insert(data).select('id').single());return json({id:saved.data!.id},201)}
  }
  if(path==='/api/files'&&r.method==='GET')return json({files:checked(await db.from('files').select('id,name,size,created_at').eq('organization_id',orgId).order('created_at',{ascending:false})).data});
  if(path.startsWith('/api/files/')){
   const id=path.split('/').at(-1)!;if(!/^[a-zA-Z0-9-]{20,80}$/.test(id))throw new HttpError(400,'Archivo no válido.');
   if(r.method==='PUT'){
    let name='';try{name=decodeURIComponent(r.headers.get('x-file-name')||'')}catch{}
    if(!name||name.length>200||/[\/\\\x00-\x1f]/.test(name)||! /\.(pdf|docx|txt|md|csv|tsv|json)$/i.test(name))throw new HttpError(400,'Nombre o formato de archivo no admitido.');
    const reader=r.body?.getReader();if(!reader)throw new HttpError(400,'Archivo vacío.');let size=0;const parts:Uint8Array[]=[];try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>3145728){await reader.cancel();throw new HttpError(413,'El máximo por archivo es 3 MB.')}parts.push(value)}}finally{reader.releaseLock()}
    if(!size)throw new HttpError(400,'Archivo vacío.');const bytes=new Uint8Array(size);let off=0;for(const p of parts){bytes.set(p,off);off+=p.length}
    const storagePath=orgId+'/'+id+'/'+randomUUID();checked(await db.storage.from('startupia-files').upload(storagePath,bytes,{contentType:'application/octet-stream',upsert:false}));
    const saved=await db.from('files').insert({id,organization_id:orgId,name,size,storage_path:storagePath});if(saved.error){await db.storage.from('startupia-files').remove([storagePath]);checked(saved)}return json({id,name,size},201);
   }
   const file=checked(await db.from('files').select('*').eq('organization_id',orgId).eq('id',id).maybeSingle()).data;if(!file)throw new HttpError(404,'Archivo no encontrado.');
   if(r.method==='GET'){const object=checked(await db.storage.from('startupia-files').download(file.storage_path)).data!;return new Response(object,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
   if(r.method==='DELETE'){checked(await db.storage.from('startupia-files').remove([file.storage_path]));checked(await db.from('files').delete().eq('organization_id',orgId).eq('id',id));return json({ok:true})}
  }
  if(/^\/api\/reports\/[a-zA-Z0-9_-]{1,100}\/package$/.test(path)&&r.method==='GET'){
   const state=(await workspace(db,orgId))?.state;if(!state||!validReports(state.reports))throw new HttpError(404,'Informe no encontrado.');const report=state.reports?.find((x:any)=>x.id===path.split('/')[3]);if(!report)throw new HttpError(404,'Espera a que el informe se guarde.');return new Response(reportPackage(report) as BodyInit,{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="startupia-report.zip"','Cache-Control':'private, no-store'}});
  }
  if(path==='/api/growth'&&r.method==='GET'){if(!growth)throw new HttpError(403,'Esta función requiere Growth activo. Puedes gestionar tu plan desde Cuenta.');const state=(await workspace(db,orgId))?.state;return json({experiments:state?.records?.experiments||[],metrics:state?.records?.metrics||[],customers:state?.records?.customers||[]})}
  if(path==='/api/integrations'&&r.method==='GET')return json({integrations:[{id:'supabase',name:'Identidad y memoria Startupia',status:'verified',detail:'Sesión y contexto de tu startup verificados en esta solicitud.'},{id:'openai',name:'Startupia AI',status:configuredModel(process.env,entitlements.plan!)?'configured':'unconfigured',detail:configuredModel(process.env,entitlements.plan!)?'Modelo configurado para tu plan. La disponibilidad se comprueba al ejecutar una consulta.':'Startupia AI está pendiente de configuración para tu plan.'},{id:'stripe',name:'Suscripciones Startupia',status:billingConfigured()?'configured':'unconfigured',detail:billingConfigured()?'Checkout en modo de pruebas configurado. Cada pago y suscripción requieren confirmación del servidor; los cobros reales no están habilitados.':'El checkout de pruebas requiere configuración segura. Los cobros reales no están habilitados.'},{id:'posthog',name:'Medición Startupia',status:process.env.POSTHOG_PROJECT_TOKEN&&process.env.POSTHOG_HOST?'configured':'unconfigured',detail:'Medición opcional con consentimiento. La recepción de eventos se verifica por separado.'}]});
  throw new HttpError(405,'Operación no disponible en esta ruta.');
 }catch(e){return json({error:e instanceof HttpError?e.message:'El servicio no está disponible. Tu trabajo guardado se conserva.'},e instanceof HttpError?e.status:503)}
}
export {handle as GET,handle as POST,handle as PUT,handle as PATCH,handle as DELETE};
