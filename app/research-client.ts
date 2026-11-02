export type PublicSource={id:string;title:string;url:string;snippet:string;publisher:string;retrievedAt:string};
export type ResearchResults={sources:PublicSource[];unavailable:string[];note:string};
const clean=(s:string)=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().slice(0,420);
export async function searchPublicSources(query:string,signal?:AbortSignal):Promise<ResearchResults>{
 const q=query.trim().slice(0,180);if(q.length<3)throw Error('Escribe un tema de al menos tres caracteres.');const retrievedAt=new Date().toISOString();
 const read=async(url:string)=>{const timeout=AbortSignal.timeout(12000);const combined=signal?AbortSignal.any([signal,timeout]):timeout;const r=await fetch(url,{credentials:'omit',signal:combined});if(!r.ok)throw Error('Fuente no disponible');return r.json() as Promise<any>};
 const results=await Promise.allSettled([
  read('https://es.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',list:'search',srsearch:q,format:'json',srlimit:'3',utf8:'1',origin:'*'})).then(d=>(d.query?.search||[]).map((s:any)=>({id:'wiki-'+s.pageid,title:clean(s.title),url:'https://es.wikipedia.org/?curid='+s.pageid,snippet:clean(s.snippet),publisher:'Wikipedia',retrievedAt}))),
  read('https://api.crossref.org/works?'+new URLSearchParams({query:q,rows:'3',select:'title,URL,abstract,DOI,publisher'})).then(d=>(d.message?.items||[]).map((s:any,i:number)=>({id:'doi-'+(s.DOI||i),title:clean(s.title?.[0]||'Investigación'),url:typeof s.URL==='string'&&s.URL.startsWith('https://')?s.URL:'https://doi.org/'+encodeURIComponent(s.DOI||''),snippet:clean(s.abstract||'Consulta el texto original antes de extraer conclusiones.'),publisher:'Crossref · '+clean(s.publisher||'Publicación académica'),retrievedAt})))
 ]);
 if(signal?.aborted)throw new DOMException('Búsqueda detenida','AbortError');
 const sources=results.flatMap(r=>r.status==='fulfilled'?r.value:[]) as PublicSource[];const unavailable=results.map((r,i)=>r.status==='rejected'?['Wikipedia','Crossref'][i]:null).filter(Boolean) as string[];
 if(unavailable.length===2)throw Error('No se pudo acceder a las fuentes públicas desde este navegador. Comprueba la conexión.');
 return {sources,unavailable,note:'Fragmentos y metadatos recuperados de Wikipedia y Crossref; no constituyen una búsqueda exhaustiva ni una verificación independiente.'};
}
