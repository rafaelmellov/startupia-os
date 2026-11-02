import {planPrices} from '../journey-validation';
import {randomUUID} from 'node:crypto';
import {identity} from '../supabase/server';
import {HttpError,json,readJson,sameOrigin} from '../http';
import {isBillingConfigured,verifyEvent,reconcileEvent,lifecycleEvents,riskEvents} from './core';

export function billingConfigured(){return isBillingConfigured(process.env)}
function config(){if(!billingConfigured())throw new HttpError(503,'Las suscripciones están pendientes de configuración segura.');return {key:process.env.STRIPE_RESTRICTED_KEY!,secret:process.env.STRIPE_WEBHOOK_SECRET!,origin:new URL(process.env.APP_ORIGIN!).origin,prices:{build:process.env.STRIPE_PRICE_BUILD!,growth:process.env.STRIPE_PRICE_GROWTH!}}}
// Instance-scoped REST client. No global API key, SDK dependency or live-mode requests.
class StripeClient {
 constructor(private key:string){}
 async request(path:string,params?:Record<string,string>,idempotency?:string):Promise<any>{
  const response=await fetch(`https://api.stripe.com/v1/${path}`,{method:params?'POST':'GET',headers:{Authorization:`Bearer ${this.key}`,'Stripe-Version':'2026-09-30.endive',...(params?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:params?new URLSearchParams(params):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new HttpError(503,'No se pudo comunicar con facturación. Reintenta.');return response.json();
 }
 async subscriptions(customer:string){let result:any[]=[];let after='';for(let page=0;page<20;page++){const data=await this.request(`subscriptions?customer=${encodeURIComponent(customer)}&status=all&limit=100${after?`&starting_after=${encodeURIComponent(after)}`:''}`);result.push(...data.data);if(!data.has_more)return result;after=data.data.at(-1).id}throw Error('Subscription pagination limit')}
 async invoices(customer:string,subscription:string){const result:any[]=[];let after='';for(let page=0;page<20;page++){const data=await this.request(`invoices?customer=${encodeURIComponent(customer)}&subscription=${encodeURIComponent(subscription)}&status=paid&limit=100${after?`&starting_after=${encodeURIComponent(after)}`:''}`);result.push(...data.data);if(!data.has_more)return result;after=data.data.at(-1).id}throw Error('Invoice pagination limit')}
}
async function rpc(operation:string,payload:Record<string,unknown>){
 const response=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/billing_operation`,{method:'POST',headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({operation,payload}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new HttpError(503,'No se pudo guardar el estado de facturación.');return response.json();
}
async function owner(request:Request){sameOrigin(request);const {db,user}=await identity();if(!user)throw new HttpError(401,'Inicia sesión para continuar.');const result=await db.from('organizations').select('id').eq('owner_id',user.id).single();if(result.error||!result.data)throw new HttpError(403,'Solo el propietario puede gestionar la suscripción.');return result.data.id as string}
async function withLease(org:string,event:string,work:(row:any,token:string)=>Promise<any>){
 const token=randomUUID();const row=await rpc('claim',{org,event,token});if(row.duplicate)return {duplicate:true};if(!row.acquired)throw new HttpError(503,'Facturación está procesando otra operación. Reintenta.');
 try{return await work(row,token)}finally{await rpc('release',{org,token}).catch(()=>{})}
}
async function action(request:Request,kind:'checkout'|'portal'){
 try{
  const org=await owner(request),cfg=config(),stripe=new StripeClient(cfg.key);const body=await readJson(request,2000);
  if(kind==='checkout'&&!['build','growth'].includes(body.plan))throw new HttpError(400,'Plan no válido.');
  return json(await withLease(org,'',async(row,token)=>{
   let customer=row.customer;
   if(!customer){const created=await stripe.request('customers',{'metadata[organization_id]':org},`startupia-customer-${org}`);customer=created.id;await rpc('bind',{org,token,customer})}
   if(kind==='portal'){const session=await stripe.request('billing_portal/sessions',{customer,return_url:`${cfg.origin}/os`});return {url:session.url}}
   const subs=await stripe.subscriptions(customer);
   if(subs.some(s=>!['canceled','incomplete_expired'].includes(s.status)))throw new HttpError(409,'Ya existe una suscripción. Gestiona tu plan desde el portal.');
   // A persisted session makes double clicks and retries safe even with different request IDs.
   if(row.session){const existing=await stripe.request(`checkout/sessions/${encodeURIComponent(row.session)}`);if(existing.status==='open'){if(row.plan!==body.plan)throw new HttpError(409,'Ya tienes un checkout abierto para otro plan. Completa o espera su vencimiento.');return {url:existing.url}}}
   const plan=body.plan as 'build'|'growth';
   const price=await stripe.request(`prices/${encodeURIComponent(cfg.prices[plan])}`);
   if(price.livemode!==false||!price.active||price.currency!=='usd'||price.unit_amount!==planPrices[plan]*100||price.recurring?.interval!=='month'||price.recurring?.interval_count!==1)throw new HttpError(503,'El precio recurrente no está disponible en pruebas.');
   // Stable across retries until the previous persisted session has expired/completed.
   const key=`startupia-checkout-${org}-${row.session||'first'}-${plan}`;
   const session=await stripe.request('checkout/sessions',{mode:'subscription',customer,'line_items[0][price]':cfg.prices[plan],'line_items[0][quantity]':'1',client_reference_id:org,'subscription_data[metadata][organization_id]':org,integration_identifier:'startupia_checkout_qmrvxkpa',success_url:`${cfg.origin}/checkout/success`,cancel_url:`${cfg.origin}/checkout/canceled`},key);
   await rpc('session',{org,token,session:session.id,plan});return {url:session.url};
  }));
 }catch(error){return json({error:error instanceof HttpError?error.message:'Facturación no disponible. Reintenta.'},error instanceof HttpError?error.status:503)}
}
export const checkout=(request:Request)=>action(request,'checkout');
export const portal=(request:Request)=>action(request,'portal');
async function rawBody(request:Request){const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Falta el evento.');const chunks:Uint8Array[]=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1048576){await reader.cancel();throw new HttpError(413,'Evento demasiado grande.')}chunks.push(value)}}finally{reader.releaseLock()}return Buffer.concat(chunks).toString('utf8')}
export async function webhook(request:Request){
 try{
  const cfg=config(),raw=await rawBody(request);let event;try{event=verifyEvent(raw,request.headers.get('stripe-signature')||'',cfg.secret)}catch{throw new HttpError(400,'Firma o evento no válido.')}
  if(!lifecycleEvents.has(event.type)&&!riskEvents.has(event.type))return json({received:true,ignored:true});
  const stripe=new StripeClient(cfg.key);let object=event.data.object;const risk=riskEvents.has(event.type);
  if(risk&&event.type!=='charge.refunded')object=await stripe.request(`charges/${encodeURIComponent(typeof object.charge==='string'?object.charge:object.charge?.id)}`);
  const customer=typeof object.customer==='string'?object.customer:object.customer?.id;
  if(!customer)throw new HttpError(503,'Evento sin cliente reconciliable.');
  const mapping=await rpc('lookup',{customer});
  // Foreign customers from the shared Stripe test account have no access to this application.
  if(!mapping.org)return json({received:true,ignored:true});
  const token=randomUUID(),org=mapping.org;
  await reconcileEvent({event:event.id,type:event.type,org,customer,risk,prices:cfg.prices},{
   claim:()=>rpc('claim',{org,event:event.id,token}),
   fetchSubscriptions:()=>stripe.subscriptions(customer),
   fetchInvoices:(subscription)=>stripe.invoices(customer,subscription),
   finish:async(state)=>{await rpc('finish',{org,token,event:event.id,event_type:event.type,customer,state,blocked:risk})},
   release:async()=>{await rpc('release',{org,token})}
  });return json({received:true});
 }catch(error){return json({error:error instanceof HttpError?error.message:'No se pudo reconciliar el evento. Stripe debe reintentarlo.'},error instanceof HttpError?error.status:503)}
}
