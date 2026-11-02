export type ResearchSource={id:string;title:string;url:string;snippet:string;publisher:string;retrievedAt:string};
const clean=(s:string)=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim().slice(0,420);
const response=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}});
export async function research(request:Request):Promise<Response|null>{
 const url=new URL(request.url);if(url.pathname!=='/api/research')return null;
 // Authentication is enforced by the central route before calling this handler.
 if(request.method!=='POST')return response({error:'Método no permitido.'},405);
 // Origin is verified by the central route using the deployment origin.
 if(!request.headers.get('Content-Type')?.includes('application/json'))return response({error:'Se requiere JSON.'},415);
 try{
  const raw=await request.text();if(raw.length>1800)return response({error:'La consulta es demasiado larga.'},413);
  const body=JSON.parse(raw);if(typeof body.query!=='string'||body.query.trim().length<3||body.query.length>180)return response({error:'Escribe un tema de 3 a 180 caracteres.'},400);
  const q=body.query.trim();const retrievedAt=new Date().toISOString();
  const fetchJSON=async(url:string)=>{const r=await fetch(url,{headers:{'User-Agent':'StartupiaOS/1.0 (public research)','Accept':'application/json'},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('source_unavailable');return r.json() as Promise<any>};
  const results=await Promise.allSettled([
   fetchJSON('https://es.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',list:'search',srsearch:q,format:'json',srlimit:'3',utf8:'1'})).then(d=>(d.query?.search||[]).map((s:any,i:number)=>({id:'wiki-'+s.pageid,title:clean(s.title),url:'https://es.wikipedia.org/?curid='+s.pageid,snippet:clean(s.snippet),publisher:'Wikipedia',retrievedAt}))),
   fetchJSON('https://api.crossref.org/works?'+new URLSearchParams({query:q,rows:'3',select:'title,URL,abstract,DOI,publisher'})).then(d=>(d.message?.items||[]).map((s:any,i:number)=>({id:'doi-'+(s.DOI||i),title:clean(s.title?.[0]||'Investigación'),url:typeof s.URL==='string'&&s.URL.startsWith('https://')?s.URL:'https://doi.org/'+encodeURIComponent(s.DOI||''),snippet:clean(s.abstract||'Metadatos bibliográficos disponibles. Consulta el texto original antes de extraer conclusiones.'),publisher:'Crossref · '+clean(s.publisher||'Publicación académica'),retrievedAt})))
  ]);
  const sources=results.flatMap(r=>r.status==='fulfilled'?r.value:[]) as ResearchSource[];
  const unavailable=results.map((r,i)=>r.status==='rejected'?['Wikipedia','Crossref'][i]:null).filter(Boolean);
  if(unavailable.length===2)return response({error:'Las fuentes públicas no están disponibles en este momento. Vuelve a intentarlo.',unavailable},502);
  return response({query:q,sources,unavailable,note:'Resultados y fragmentos recuperados de Wikipedia y Crossref; no equivalen a una verificación independiente ni a una búsqueda exhaustiva de la web.'});
 }catch{return response({error:'No se pudo completar la búsqueda. Revisa la consulta e inténtalo de nuevo.'},400)}
}
