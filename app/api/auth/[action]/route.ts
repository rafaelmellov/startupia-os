import {commercialPlan,recordInitialPlan} from '../../../../lib/initial-plan';
import {identity,database} from '../../../../lib/supabase/server';
import {json,readJson,sameOrigin,safeNext,HttpError} from '../../../../lib/http';
export async function POST(r:Request,{params}:{params:Promise<{action:string}>}){
 try{
  sameOrigin(r);const origin=process.env.APP_ORIGIN||r.headers.get('origin')||new URL(r.url).origin;const {action}=await params;const db=await database();
  if(action==='logout'){await db.auth.signOut();return json({ok:true})}
  const b=await readJson(r,4000);const email=typeof b.email==='string'?b.email.trim():'';
  if(action==='password'){
   const {user}=await identity();if(!user)throw new HttpError(401,'Inicia sesión para cambiar tu contraseña.');
   if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw new HttpError(400,'Usa una contraseña de 12 a 128 caracteres.');
   const {error}=await db.auth.updateUser({password:b.password});if(error)throw new HttpError(400,'No se pudo actualizar la contraseña. Solicita un nuevo enlace.');return json({ok:true});
  }
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>200)throw new HttpError(400,'Introduce un correo válido.');
  if(action==='reset'){
   await db.auth.resetPasswordForEmail(email,{redirectTo:new URL('/auth/callback?next=/reset-password',origin).href});
   return json({message:'Si la cuenta existe, recibirás un enlace para recuperar el acceso.'});
  }
  if(!['login','register'].includes(action))throw new HttpError(404,'Ruta no encontrada.');
  if(typeof b.password!=='string'||b.password.length>128||(action==='register'?b.password.length<12:!b.password))throw new HttpError(400,'Usa una contraseña de al menos 12 caracteres para registrarte.');
  const plan=commercialPlan(b.plan);
  const result=action==='login'?await db.auth.signInWithPassword({email,password:b.password}):await db.auth.signUp({email,password:b.password,options:{emailRedirectTo:new URL('/auth/callback?next='+encodeURIComponent(safeNext(b.next||'/onboarding')),origin).href,data:plan?{startupia_plan:plan}:{}}});
  if(result.error)throw new HttpError(400,action==='login'?'No pudimos iniciar sesión. Comprueba tu correo, contraseña y confirmación de email.':'No se pudo crear la cuenta. Comprueba los datos o intenta recuperar el acceso.');
  if(result.data.session&&result.data.user&&plan)await recordInitialPlan(db,result.data.user.id,plan);
  return json(result.data.session?{next:safeNext(b.next||(action==='register'?'/onboarding':'/os'))}:{message:'Revisa tu correo para confirmar la cuenta y continuar.'});
 }catch(e){return json({error:e instanceof HttpError?e.message:'El servicio de acceso no está disponible.'},e instanceof HttpError?e.status:503)}
}
