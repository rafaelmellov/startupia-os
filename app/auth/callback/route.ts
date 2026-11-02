import {recordInitialPlan} from '../../../lib/initial-plan';
import {database} from '../../../lib/supabase/server';
import {safeNext} from '../../../lib/http';
export async function GET(request:Request){
 const url=new URL(request.url),redirectBase=process.env.APP_ORIGIN||url.origin,code=url.searchParams.get('code');
 if(code){const db=await database();const {error}=await db.auth.exchangeCodeForSession(code);if(!error){const {data:{user}}=await db.auth.getUser();if(user){try{await recordInitialPlan(db,user.id,user.user_metadata?.startupia_plan)}catch{return Response.redirect(new URL('/account?setup=retry',redirectBase),303)}}const next=url.searchParams.get('next');return Response.redirect(new URL(next==='/access?mode=password'?next:safeNext(next),redirectBase),303)}}
 return Response.redirect(new URL('/access?error=expired',redirectBase),303);
}
