import {landingHTML} from '../lib/experience-html';
export async function GET(){return new Response(landingHTML,{headers:{'Content-Type':'text/html; charset=utf-8'}})}
