import {reports} from './reports';
import { research } from './research';
import { api } from './api';
import {journey} from './journey';
import landing from '../experience/landing.html?raw';
import access from '../experience/access.html?raw';
import onboarding from '../experience/onboarding.html?raw';
import handler from "vinext/server/fetch-handler";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const path=new URL(request.url).pathname;
    const owner=request.headers.get('oai-authenticated-user-id')||(import.meta.env.DEV?'local-preview-owner':null);
    const html=(content:string)=>new Response(content,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'}});
    if(path==='/'||path==='/landing')return html(landing);
    if(path==='/access'||path==='/login')return html(access);
    if(path==='/onboarding'){if(!owner)return Response.redirect(new URL('/access?next=/onboarding',request.url),302);return html(onboarding)}
    if((path==='/os'||path==='/admin')&&!owner)return Response.redirect(new URL('/access?next='+encodeURIComponent(path),request.url),302);
    try{const response=await journey(request,env as any);if(response)return response}catch{return Response.json({error:'El servicio no está disponible. Inténtalo de nuevo.'},{status:503,headers:{'Cache-Control':'private, no-store'}})}
    const reportResponse = await reports(request, env as any);
    if (reportResponse) return reportResponse;
    const researchResponse = await research(request);
    if (researchResponse) return researchResponse;
    const response = await api(request, env as any);
    if (response) return response;
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
