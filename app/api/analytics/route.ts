import {identity} from '../../../lib/supabase/server';
import {HttpError,json,readJson,sameOrigin} from '../../../lib/http';
import {analyticsPayload,createRateLimiter,privacySignal,validAnalyticsInput} from '../../../lib/analytics/core';
export const runtime='nodejs';
const allow=createRateLimiter();
export async function POST(request:Request){
 try{
  sameOrigin(request);
  if(privacySignal(request.headers.get('dnt'),request.headers.get('sec-gpc')))return json({skipped:true});
  const input=await readJson(request,1000);
  if(!validAnalyticsInput(input))throw new HttpError(400,'Evento no permitido.');
  const {user}=await identity();
  if(!user)throw new HttpError(401,'Inicia sesión para continuar.');
  if(!allow(user.id))throw new HttpError(429,'Límite de medición alcanzado.');
  const token=process.env.POSTHOG_PROJECT_TOKEN,host=process.env.POSTHOG_HOST;
  if(!token||!host)return json({skipped:true});
  // Only configured cloud ingestion hosts; never forward request headers or user identity.
  if(!['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(host))return json({skipped:true});
  const response=await fetch(host+'/i/v0/e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(analyticsPayload(input,token)),signal:AbortSignal.timeout(3000),redirect:'error'});
  if(!response.ok)return json({skipped:true});
  return json({ok:true});
 }catch(error){return json({error:error instanceof HttpError?error.message:'Medición no disponible.'},error instanceof HttpError?error.status:503)}
}
