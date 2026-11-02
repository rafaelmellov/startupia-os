import {onboardingHTML} from '../../lib/experience-html';
import {identity} from '../../lib/supabase/server';
export async function GET(r:Request){const {user}=await identity();if(!user)return Response.redirect(new URL('/access?next=/onboarding',r.url),303);return new Response(onboardingHTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}})}
