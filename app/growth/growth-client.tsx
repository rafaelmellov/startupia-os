'use client';

import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight,FlaskConical,ChartNoAxesCombined,Users,Plus,RefreshCw} from 'lucide-react';
import {emptyEntry,initial,uid,type Entry,type Workspace} from '../model';
import {fingerprint,validDate,validEntry} from '../../lib/workspace-actions';
import {validWorkspace} from '../../lib/workspace-validation';
import styles from './growth.module.css';

type Kind='experiments'|'metrics'|'customers';
type Access='loading'|'ready'|'locked'|'signed-out'|'error';
type Draft={kind:Kind;entry:Entry;original:Entry|null;value:string;target:string};
const sections:{kind:Kind;title:string;singular:string;description:string;icon:typeof Users}[]=[
 {kind:'experiments',title:'Experimentos',singular:'experimento',description:'Pruebas con una hipótesis y un criterio de éxito.',icon:FlaskConical},
 {kind:'metrics',title:'Métricas',singular:'métrica',description:'Mediciones que puedes respaldar con una fuente.',icon:ChartNoAxesCombined},
 {kind:'customers',title:'Clientes',singular:'cliente',description:'Personas, conversaciones y próximos pasos.',icon:Users},
];
class RequestError extends Error {constructor(message:string,readonly status:number){super(message)}}
async function request(path:string,options:RequestInit={}){const response=await fetch(path,{...options,cache:'no-store',signal:AbortSignal.timeout(15000)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new RequestError(data.error||'No pudimos completar la solicitud. Vuelve a intentarlo.',response.status);return data}
async function readWorkspace(){const data=await request('/api/workspace');if(!Number.isInteger(data.version)||data.version<0||(data.state!==null&&!validWorkspace(data.state)))throw Error('El espacio recibido no es válido. No se modificarán tus datos.');return {state:(data.state||{...structuredClone(initial),records:{}}) as Workspace,version:data.version as number}}
const message=(error:unknown)=>error instanceof Error?error.message:'No se pudo conectar. Vuelve a intentarlo.';
export default function Growth(){
 const [access,setAccess]=useState<Access>('loading'),[workspace,setWorkspace]=useState<Workspace|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[kind,setKind]=useState<Kind>('experiments'),[query,setQuery]=useState(''),[draft,setDraft]=useState<Draft|null>(null),[saving,setSaving]=useState(false);
 const savingRef=useRef(false),loadId=useRef(0),titleInput=useRef<HTMLInputElement>(null),newButton=useRef<HTMLButtonElement>(null);
 const load=useCallback(async()=>{const id=++loadId.current;setAccess('loading');setError('');try{await request('/api/growth');const current=await readWorkspace();if(id!==loadId.current)return;setWorkspace(current.state);setAccess('ready')}catch(e){if(id!==loadId.current)return;setError(message(e));setAccess(e instanceof RequestError&&e.status===403?'locked':e instanceof RequestError&&e.status===401?'signed-out':'error')}},[]);
 useEffect(()=>{void load();return()=>{loadId.current++}},[load]);
 useEffect(()=>{if(draft)titleInput.current?.focus()},[draft?.entry.id]);
 useEffect(()=>{if(!draft)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault()};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[draft]);
 const open=(entry?:Entry)=>{setError('');setNotice('');const next=entry?structuredClone(entry):{...emptyEntry(),date:'',tag:'',target:0};setDraft({kind,entry:next,original:entry?structuredClone(entry):null,value:entry?String(entry.value):'',target:entry?String(entry.target):''})};
 const close=()=>{setDraft(null);setError('');requestAnimationFrame(()=>newButton.current?.focus())};
 const change=(patch:Partial<Entry>)=>setDraft(current=>current?{...current,entry:{...current.entry,...patch}}:null);
 async function save(event:FormEvent){event.preventDefault();if(!draft||savingRef.current)return;savingRef.current=true;setSaving(true);setError('');setNotice('');try{
  const entry={...draft.entry,title:draft.entry.title.trim(),value:draft.kind==='metrics'?Number(draft.value):draft.entry.value,target:draft.kind==='metrics'?Number(draft.target):draft.entry.target};
  if(draft.kind==='metrics'&&(!draft.value.trim()||!draft.target.trim()))throw Error('Introduce el valor observado y la meta. El cero debe registrarse explícitamente.');
  if(!validEntry(entry)||!validDate(entry.date))throw Error('Revisa el título, la fecha y los valores numéricos.');
  await request('/api/growth');
  const current=await readWorkspace(),list=current.state.records[draft.kind]||[],existing=list.find(item=>item.id===entry.id);
  // A repeated save after a lost response must not create a second record.
  if(fingerprint(existing)===fingerprint(entry)){setWorkspace(current.state);setDraft(null);setNotice('Este registro ya está guardado.');return}
  if(draft.original&&fingerprint(existing)!==fingerprint(draft.original))throw new RequestError('Este registro cambió en otra sesión. Conserva tu texto, cancela la edición y actualiza la vista antes de editar la versión nueva.',409);
  if(!draft.original&&existing)throw new RequestError('Este registro ya existe. Actualiza la vista antes de continuar.',409);
  const next:Workspace={...current.state,records:{...current.state.records,[draft.kind]:existing?list.map(item=>item.id===entry.id?entry:item):[entry,...list]},activity:[{id:uid(),title:`Growth: ${draft.original?'actualizado':'creado'} ${sections.find(section=>section.kind===draft.kind)!.singular} · ${entry.title}`,date:new Date().toISOString()},...current.state.activity].slice(0,300)};
  if(!validWorkspace(next))throw Error('El espacio supera los límites o contiene datos no válidos. Revisa tus registros antes de guardar.');
  const result=await request('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:next,version:current.version})});
  if(!Number.isInteger(result.version)||result.version<=current.version)throw Error('No se recibió la confirmación. Conservamos el formulario; vuelve a guardar para comprobarlo.');
  setWorkspace(next);setDraft(null);setNotice('Guardado en tu workspace compartido.');requestAnimationFrame(()=>newButton.current?.focus());
 }catch(e){setError(e instanceof RequestError&&e.status===409?message(e)+' No se sobrescribieron los cambios de otra sesión.':message(e));if(e instanceof RequestError&&[401,403].includes(e.status))setAccess(e.status===403?'locked':'signed-out')}finally{savingRef.current=false;setSaving(false)}}
 const section=sections.find(item=>item.kind===kind)!,records=workspace?.records[kind]||[],filtered=records.filter(entry=>(entry.title+' '+entry.description+' '+entry.tag).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
 return <main className={styles.page}>
  <nav className={styles.nav} aria-label="Navegación de Growth"><a href="/os">← Mi workspace</a><a href="/os#usage">Plan y uso <ArrowUpRight size={15}/></a></nav>
  <header className={styles.hero}><div><span className={styles.eyebrow}>STARTUPIA OS / GROWTH</span><h1>Crece con evidencia.</h1><p>Una hipótesis, una prueba y una decisión. Conecta tus experimentos con lo que observas de tu negocio.</p></div><span className={styles.badge}>{access==='ready'?'Growth activo':'Tu siguiente etapa'}</span></header>
  {access==='loading'?<section className={styles.panel} role="status">Conectando con tu workspace…</section>:access!=='ready'?<section className={styles.panel}><span className={styles.eyebrow}>{access==='locked'?'GROWTH':access==='signed-out'?'TU CUENTA':'CONEXIÓN'}</span><h2>{access==='locked'?'Un espacio para medir tu siguiente etapa.':access==='signed-out'?'Continúa con tu cuenta.':'No pudimos cargar tu espacio.'}</h2><p role="status">{error}</p>{access==='locked'&&<p>Growth se habilita con una suscripción vigente verificada. Elegir un plan no activa una suscripción. Tus herramientas de Build siguen disponibles.</p>}<div className={styles.actions}><a className={styles.primary} href={access==='signed-out'?'/access':'/os#usage'}>{access==='signed-out'?'Iniciar sesión':'Ver mi plan'} <ArrowUpRight size={16}/></a><button type="button" onClick={()=>void load()}>Comprobar de nuevo</button></div>{draft&&<p>Tu formulario permanece en esta pestaña. Podrás retomarlo cuando se restablezca el acceso.</p>}</section>:<>
  <div className={styles.summary}>{sections.map(({kind:target,title,description,icon:Icon})=><button type="button" key={target} className={styles.summaryCard} aria-pressed={kind===target} disabled={!!draft} onClick={()=>{setKind(target);setQuery('');setError('')}}><Icon size={21}/><span>{title}<strong>{(workspace?.records[target]||[]).length}</strong><small>{description}</small></span></button>)}</div>
  <div className={styles.context}><span className={styles.dot}/><span><strong>{workspace?.profile.name||'Mi startup'}</strong> · El mismo contexto que usas en Build.</span><button type="button" disabled={!!draft||saving} onClick={()=>void load()}><RefreshCw size={14}/> Actualizar</button></div>
  {notice&&<p className={styles.notice} role="status">{notice}</p>}
  <section className={styles.panel} aria-labelledby="records-heading"><div className={styles.sectionHead}><div><span className={styles.eyebrow}>TU REGISTRO DE CRECIMIENTO</span><h2 id="records-heading">{section.title}</h2></div><button ref={newButton} type="button" className={styles.primary} disabled={!!draft} onClick={()=>open()}><Plus size={17}/> {kind==='metrics'?'Registrar métrica':kind==='customers'?'Registrar cliente':'Crear experimento'}</button></div>
  {draft&&<form className={styles.editor} onSubmit={save} aria-labelledby="editor-heading"><h3 id="editor-heading">{draft.original?'Editar':'Nuevo registro'} · {section.singular}</h3><fieldset disabled={saving}><div className={styles.formGrid}>
   <label className={styles.full}>Título<input ref={titleInput} required maxLength={500} value={draft.entry.title} onChange={e=>change({title:e.target.value})} placeholder={kind==='experiments'?'¿Qué quieres poner a prueba?':kind==='metrics'?'Nombre de la métrica y unidad':'Nombre de la persona o empresa'}/></label>
   <label>Estado<select value={draft.entry.status} onChange={e=>change({status:e.target.value})}>{!['Por hacer','En progreso','Completado'].includes(draft.entry.status)&&<option>{draft.entry.status}</option>}<option>Por hacer</option><option>En progreso</option><option>Completado</option></select></label>
   <label>{kind==='metrics'?'Fecha de medición':'Fecha de seguimiento'}<input type="date" value={draft.entry.date} onChange={e=>change({date:e.target.value})}/></label>
   {kind==='metrics'&&<><label>Valor observado<input required type="number" step="any" value={draft.value} onChange={e=>setDraft({...draft,value:e.target.value})}/></label><label>Meta<input required type="number" step="any" value={draft.target} onChange={e=>setDraft({...draft,target:e.target.value})}/></label></>}
   <label>Etiqueta<input maxLength={200} value={draft.entry.tag} onChange={e=>change({tag:e.target.value})} placeholder={kind==='customers'?'Por ejemplo: prospecto':'Canal, segmento o categoría'}/></label><label>Fuente o referencia<input maxLength={2000} value={draft.entry.source} onChange={e=>change({source:e.target.value})} placeholder="Dónde puedes comprobarlo"/></label>
   <label className={styles.full}>{kind==='experiments'?'Hipótesis, criterio de éxito y aprendizaje':kind==='metrics'?'Contexto de la medición':'Contexto y próximo paso'}<textarea rows={7} maxLength={30000} value={draft.entry.description} onChange={e=>change({description:e.target.value})} placeholder={kind==='experiments'?'Hipótesis:\nPrueba y segmento:\nCriterio de éxito (antes de probar):\nResultado observado:\nAprendizaje y siguiente decisión:':kind==='metrics'?'Describe la unidad, el período y cómo obtuviste este valor.':'Registra lo que conversaron y el siguiente paso acordado.'}/></label>
  </div></fieldset>{error&&<p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><button type="submit" className={styles.primary} disabled={saving}>{saving?'Guardando…':'Guardar en mi workspace'}</button><button type="button" disabled={saving} onClick={close}>Cancelar edición</button><small>Los cambios se guardan al confirmar.</small></div></form>}
  {!draft&&error&&<p className={styles.error} role="alert">{error}</p>}
  <label className={styles.search}>Buscar en {section.title.toLowerCase()}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Título, contenido o etiqueta"/></label>
  {!filtered.length?<div className={styles.empty}><section.icon size={30}/><h3>{query?'Sin coincidencias':`Todavía no tienes ${section.title.toLowerCase()}`}</h3><p>{query?'Prueba otra palabra o borra la búsqueda.':section.description+' Empieza con tu primer registro.'}</p></div>:<div className={styles.records}>{filtered.map(entry=><article className={styles.record} key={entry.id}><div className={styles.recordHead}><span className={styles.status}>{entry.status}</span>{entry.date&&<time dateTime={entry.date}>{entry.date}</time>}</div><h3>{entry.title}</h3>{kind==='metrics'&&<p className={styles.measure}><strong>{entry.value.toLocaleString('es')}</strong><span>Meta: {entry.target.toLocaleString('es')}</span></p>}{entry.description?<p className={styles.description}>{entry.description}</p>:<p className={styles.muted}>Sin contexto registrado.</p>}{entry.source&&<p className={styles.source}>Fuente: {entry.source}</p>}<footer>{entry.tag&&<span>{entry.tag}</span>}<button type="button" disabled={!!draft} onClick={()=>open(entry)} aria-label={`Editar ${entry.title}`}>Editar <ArrowUpRight size={14}/></button></footer></article>)}</div>}
  </section><aside className={styles.note}><FlaskConical size={19}/><p><strong>Primero el criterio. Después el resultado.</strong> Define qué evidencia cambiaría tu decisión antes de ejecutar una prueba. Los registros de clientes no acreditan ventas y las métricas se muestran tal como las registras.</p></aside>
  </>}
 </main>
}
