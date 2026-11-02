import {createHmac,timingSafeEqual} from 'node:crypto';
export function verifyEvent(raw:string,header:string,secret:string,now=Date.now()) {
 const parts=header.split(',').map(x=>x.split('='));const timestamps=parts.filter(x=>x[0]==='t');
 if(timestamps.length!==1||!/^\d+$/.test(timestamps[0][1]))throw Error('Invalid signature');
 const timestamp=Number(timestamps[0][1]);if(Math.abs(now/1000-timestamp)>300)throw Error('Expired signature');
 const expected=createHmac('sha256',secret).update(`${timestamp}.${raw}`).digest();
 if(!parts.some(([k,v])=>k==='v1'&&/^[a-f0-9]{64}$/i.test(v)&&timingSafeEqual(expected,Buffer.from(v,'hex'))))throw Error('Invalid signature');
 const event=JSON.parse(raw);if(!/^evt_/.test(event.id)||typeof event.type!=='string'||event.livemode!==false||!event.data?.object)throw Error('Invalid event');return event;
}
export function subscriptionState(subscriptions:any[],prices:{build:string;growth:string},blocked=false){
 const supported=subscriptions.filter(s=>s.items?.data?.length===1&&s.items.data[0].quantity===1&&[prices.build,prices.growth].includes(s.items.data[0].price?.id));
 const active=supported.filter(s=>['active','trialing'].includes(s.status));
 const sub=(active.length?active:supported).sort((a,b)=>b.created-a.created)[0];
 if(!sub)return null;
 const until=sub.items.data[0].current_period_end;
 if(!Number.isFinite(until))throw Error('Missing subscription period');
 return {plan:sub.items.data[0].price.id===prices.growth?'growth':'build',status:blocked?'canceled':['active','trialing','past_due','canceled','incomplete'].includes(sub.status)?sub.status:'canceled',provider:'stripe',provider_subscription_id:sub.id,valid_until:new Date(until*1000).toISOString(),payment_verified_until:null as string|null};
}
const resourceId=(value:any)=>typeof value==='string'?value:value?.id;
// A current subscription alone is not payment evidence. In particular, an unpaid
// upgrade must never reuse the paid invoice for the previous, cheaper price.
export function paidInvoiceUntil(sub:any,invoices:any[],customer:string,now=Date.now()):string|null{
 if(sub?.status!=='active'||sub.items?.data?.length!==1)return null;
 const item=sub.items.data[0],end=item.current_period_end;
 if(item.quantity!==1||!Number.isFinite(end)||end*1000<=now)return null;
 let paidUntil=0;
 for(const invoice of invoices){
  if(invoice.livemode!==false||invoice.status!=='paid'||invoice.paid_out_of_band===true||invoice.currency!=='usd'||!(invoice.amount_paid>0)||resourceId(invoice.customer)!==customer||resourceId(invoice.parent?.subscription_details?.subscription??invoice.subscription)!==sub.id||invoice.lines?.has_more!==false)continue;
  for(const line of invoice.lines?.data??[]){
   const details=line.parent?.subscription_item_details;
   const price=resourceId(line.pricing?.price_details?.price??line.price);
   const subscriptionItem=resourceId(details?.subscription_item??line.subscription_item);
   const subscription=resourceId(details?.subscription??line.subscription);
   if(price!==item.price?.id||subscriptionItem!==item.id||subscription!==sub.id||line.quantity!==1||!(line.amount>0)||!Number.isFinite(line.period?.start)||!Number.isFinite(line.period?.end)||line.period.start>now/1000||line.period.end<=line.period.start)continue;
   paidUntil=Math.max(paidUntil,Math.min(end,line.period.end));
  }
 }
 return paidUntil*1000>now?new Date(paidUntil*1000).toISOString():null;
}
export const lifecycleEvents=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.paused','customer.subscription.resumed','invoice.paid','invoice.payment_failed']);
export const riskEvents=new Set(['charge.dispute.created','charge.refunded','radar.early_fraud_warning.created']);
// Always fetch the current Stripe state after acquiring a tenant lease: event delivery order
// and event.created are not a safe version of a subscription.
export async function reconcileEvent(input:{event:string;type:string;org:string;customer:string;risk:boolean;prices:{build:string;growth:string}},dependencies:{claim:()=>Promise<any>;fetchSubscriptions:()=>Promise<any[]>;fetchInvoices:(subscription:string)=>Promise<any[]>;finish:(state:any)=>Promise<void>;release:()=>Promise<void>}){
 const row=await dependencies.claim();if(row.duplicate)return {duplicate:true};if(!row.acquired)throw Error('Billing lease busy');
 try{const subscriptions=await dependencies.fetchSubscriptions();const state=subscriptionState(subscriptions,input.prices,row.blocked||input.risk);if(state?.status==='active'){const sub=subscriptions.find(s=>s.id===state.provider_subscription_id);state.payment_verified_until=paidInvoiceUntil(sub,await dependencies.fetchInvoices(sub.id),input.customer)}await dependencies.finish(state);return {duplicate:false}}
 finally{await dependencies.release().catch(()=>{})}
}

export function isBillingConfigured(env:Record<string,string|undefined>){
 if(env.STRIPE_BILLING_ENABLED!=='true'||!env.STRIPE_RESTRICTED_KEY?.startsWith('rk_test_')||!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')||!env.STRIPE_PRICE_BUILD?.startsWith('price_')||!env.STRIPE_PRICE_GROWTH?.startsWith('price_')||env.STRIPE_PRICE_BUILD===env.STRIPE_PRICE_GROWTH||!env.SUPABASE_SERVICE_ROLE_KEY||!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return false;
 try{const origin=new URL(env.APP_ORIGIN||'');const database=new URL(env.NEXT_PUBLIC_SUPABASE_URL||'');return ['https:','http:'].includes(origin.protocol)&&['https:','http:'].includes(database.protocol)}catch{return false}
}
