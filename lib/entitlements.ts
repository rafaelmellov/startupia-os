import type {database} from './supabase/server';
import {HttpError} from './http';

export type PaidPlan='build'|'growth';
export type SubscriptionSnapshot={
 plan?:unknown;status?:unknown;provider?:unknown;provider_subscription_id?:unknown;
 valid_until?:unknown;payment_verified_until?:unknown;
};
export type Entitlements={
 build:boolean;growth:boolean;plan:PaidPlan|null;
 reason:'ready'|'not_subscribed'|'not_active'|'not_verified'|'expired';
 ai:{dailyExecutions:number;maxOutputTokens:number};
};
const date=(value:unknown)=>typeof value==='string'?Date.parse(value):Number.NaN;
/** Billing rows are server-owned. Neither plan interest nor user metadata grants access. */
export function deriveEntitlements(subscription:SubscriptionSnapshot|null|undefined,now=Date.now()):Entitlements{
 const denied=(reason:Entitlements['reason']):Entitlements=>({build:false,growth:false,plan:null,reason,ai:{dailyExecutions:0,maxOutputTokens:0}});
 if(!subscription)return denied('not_subscribed');
 if(subscription.status!=='active'||!['build','growth'].includes(String(subscription.plan)))return denied('not_active');
 if(subscription.provider!=='stripe'||typeof subscription.provider_subscription_id!=='string'||!/^sub_[A-Za-z0-9]+$/.test(subscription.provider_subscription_id))return denied('not_verified');
 const paidUntil=date(subscription.payment_verified_until),validUntil=date(subscription.valid_until);
 if(!Number.isFinite(paidUntil))return denied('not_verified');
 if(!Number.isFinite(validUntil)||paidUntil<=now||validUntil<=now)return denied('expired');
 const plan=subscription.plan as PaidPlan,growth=plan==='growth';
 return {build:true,growth,plan,reason:'ready',ai:{dailyExecutions:growth?60:10,maxOutputTokens:growth?3600:1800}};
}
type Db=Awaited<ReturnType<typeof database>>;
export async function requirePaidAccess(db:Db,userId:string){
 const organization=await db.from('organizations').select('id').eq('owner_id',userId).maybeSingle();
 if(organization.error)throw new HttpError(503,'No se pudo verificar el acceso de tu startup.');
 if(!organization.data)throw new HttpError(403,'Prepara tu cuenta antes de entrar a Startupia OS.');
 const result=await db.from('subscriptions').select('plan,status,provider,provider_subscription_id,valid_until,payment_verified_until').eq('organization_id',organization.data.id).maybeSingle();
 if(result.error)throw new HttpError(503,'No se pudo comprobar tu suscripción. Inténtalo de nuevo.');
 const subscription=result.data as SubscriptionSnapshot|null,entitlements=deriveEntitlements(subscription);
 if(!entitlements.build)throw new HttpError(402,'Elige un plan y completa un pago válido para activar Startupia OS. Tu información guardada se conserva.');
 return {organizationId:organization.data.id as string,subscription:subscription!,entitlements};
}
