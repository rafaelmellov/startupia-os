'use strict';
(() => {
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const STORAGE = 'startupia-onboarding-v1';
const steps = [
  ['Bienvenido', 'El comienzo de algo grande', 'BIENVENIDO A STARTUPIA OS'],
  ['Tu etapa', 'Tu punto de partida', 'CONOZCÁMONOS'],
  ['Tu startup', 'Dale su propio contexto', 'TU STARTUP'],
  ['Tu enfoque', 'Lo que importa ahora', 'TU PRIORIDAD'],
  ['Tu espacio', 'Así se conecta todo', 'TU ESPACIO'],
  ['Todo listo', 'Revisa tu comienzo', 'TU PRÓXIMO CAPÍTULO']
];
const stages = [
 {id:'idea',icon:'◉',name:'Tengo una idea',description:'Quiero descubrir si resuelve un problema real.',action:'Define la primera hipótesis',task:'Describe a la persona que tiene el problema.'},
 {id:'validation',icon:'⌁',name:'Estoy validando',description:'Estoy hablando con clientes y probando mi propuesta.',action:'Escucha a tus primeros clientes',task:'Prepara cinco preguntas para tus entrevistas.'},
 {id:'mvp',icon:'◇',name:'Construyo mi MVP',description:'Ya tengo señales y estoy creando una primera versión.',action:'Enfoca tu primera versión',task:'Separa lo esencial de lo que puede esperar.'},
 {id:'clients',icon:'♧',name:'Ya tengo clientes',description:'Mi producto está en el mercado y quiero crecer.',action:'Entiende por qué te eligen',task:'Registra qué tienen en común tus mejores clientes.'},
 {id:'traction',icon:'↗',name:'Busco más tracción',description:'Quiero que las ventas sean más constantes.',action:'Encuentra tu próximo experimento',task:'Elige un canal y una métrica para probarlo.'},
 {id:'exploring',icon:'✧',name:'Estoy explorando',description:'Aún no tengo una idea. Quiero encontrar por dónde empezar.',action:'Empieza por un problema cercano',task:'Anota tres problemas que hayas observado esta semana.'}
];
const goals = [
 {id:'validate',icon:'◎',name:'Validar mi idea',description:'Comprobar el problema antes de invertir más.',module:'operators'},
 {id:'build',icon:'◇',name:'Definir mi MVP',description:'Elegir qué construir primero y qué dejar fuera.',module:'mvp'},
 {id:'customers',icon:'↗',name:'Conseguir clientes',description:'Encontrar y entender a mis primeros compradores.',module:'operators'},
 {id:'organize',icon:'▦',name:'Ordenar mi trabajo',description:'Convertir mis prioridades en acciones concretas.',module:'manager'},
 {id:'decide',icon:'✧',name:'Tomar mejores decisiones',description:'Contrastar opciones con el contexto de mi startup.',module:'copilot'},
 {id:'grow',icon:'⌁',name:'Medir y crecer',description:'Seguir objetivos y aprender de los resultados.',module:'manager'}
];
const modules = {
 manager:{name:'Startup Manager',icon:'▦',tag:'De la intención a la acción',title:'Una prioridad. Un siguiente paso.',description:'Proyectos, tareas y objetivos en un mismo lugar.',task:'Convierte tu prioridad en una tarea concreta.'},
 operators:{name:'Startupia Operators',icon:'⌘',tag:'Investiga con una pregunta',title:'Menos suposiciones. Mejores preguntas.',description:'Flujos de IA para investigar y preparar entrevistas.',task:'Define qué necesitas saber de tus clientes.'},
 mvp:{name:'MVP Creator',icon:'◇',tag:'Construye lo que importa',title:'Lo esencial para tu primera prueba.',description:'Define el alcance de tu MVP antes de construirlo.',task:'Elige la única función que resuelve el problema.'},
 copilot:{name:'Copiloto de IA',icon:'✧',tag:'Una mirada con contexto',title:'Tu startup como punto de partida.',description:'Orientación que conecta tus preguntas con tu contexto.',task:'Escribe la decisión que necesitas aclarar hoy.'}
};
const fresh = () => ({step:0,furthest:0,stage:'',founder:'',startup:'',sector:'',idea:'',problem:'',audience:'',difficulty:'',team:'solo',goals:[],time:'5',completed:false});
let state=fresh(), storageAvailable=true, previewModule='manager', toastTimer, isTransitioning=false;
let serverVersion=0,saveTimer,saveChain=Promise.resolve(),loaded=false,dirty=false,syncConflict=false;
const escape = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
state.team=['solo','small','team'].includes(state.team)?state.team:'solo';
state.time=['2','5','10'].includes(state.time)?state.time:'5';
for(const [key,max] of Object.entries({founder:40,startup:60,idea:300,audience:120}))state[key]=state[key].slice(0,max);
const selectedStage=()=>stages.find(s=>s.id===state.stage)||stages[0];
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const p=localStorage.getItem('startupia-motion');if(p!==null)reduced=p==='reduced';}catch(e){}
function applyMotion(){document.body.classList.toggle('reduced',reduced);document.body.classList.toggle('motion-enabled',!reduced);$('#motionToggle').setAttribute('aria-pressed',String(reduced));$('#motionLabel').textContent=reduced?'Activar movimiento':'Reducir movimiento';}
applyMotion();
function save(){
 if(!loaded||syncConflict)return;
 dirty=true;$('#saveStatus').textContent='Guardando tu progreso…';clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>persist(false).catch(()=>{}),450);
}
function syncError(message){
 $('#saveStatus').textContent='Cambios sin sincronizar';
 const banner=$('#syncError');banner.hidden=false;banner.querySelector('span').textContent=message;
}
function persist(complete=false){
 clearTimeout(saveTimer);
 const snapshot=JSON.parse(JSON.stringify(state));snapshot.completed=complete;
 const task=saveChain.catch(()=>{}).then(async()=>{
  if(syncConflict)throw Error('Recarga para recuperar la versión actual de tu progreso.');
  const response=await fetch('/api/onboarding',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:snapshot,version:serverVersion,complete}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(!response.ok){if(response.status===409)syncConflict=true;throw Error(data.error||'No se pudo guardar tu progreso.');}
  serverVersion=data.version;if(JSON.stringify({...state,completed:complete})===JSON.stringify(snapshot))dirty=false;
  $('#saveStatus').textContent='Progreso guardado en tu cuenta';$('#syncError').hidden=true;
  return data;
 });
 saveChain=task;
 task.catch(error=>syncError(error.message||'No pudimos sincronizar. Tus cambios siguen en esta pantalla.'));
 return task;
}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3700);}
function nav(){
 $('#stepNav').innerHTML=steps.map((s,i)=>`<button type="button" data-step="${i}" class="${i===state.step?'active':i<state.step?'done':''}" ${i>state.furthest?'disabled':''} ${i===state.step?'aria-current="step"':''}><span class="step-index">${i<state.step?'✓':String(i+1).padStart(2,'0')}</span><span><span class="step-label">${s[0]}</span><span class="step-caption">${s[1]}</span></span></button>`).join('');
 $('#stepKicker').textContent=`${String(state.step+1).padStart(2,'0')} / ${steps[state.step][2]}`;
 $('#mobileFill').style.width=((state.step+1)/6*100)+'%';
 $('#back').style.visibility=state.step===0?'hidden':'visible';
 $('#nextLabel').textContent=state.step===5?(state.completed?'Entrar a Startupia OS':'Crear mi workspace'):state.step===4?'Revisar mi configuración':state.step===0?'Personalizar mi espacio':'Continuar';
 $('#next').disabled=state.step===1?!state.stage:state.step===3?state.goals.length===0:false;
 const hints=['Tu cuenta ya tiene su lugar. Ahora, dale tu dirección.','No importa dónde estés. Importa tu siguiente paso.','Tu idea puede evolucionar. Este es solo su punto de partida.','Elige lo que te ayudará a avanzar esta semana.','Un mismo contexto conecta tus cuatro herramientas.','Puedes revisar y editar tus respuestas antes de comenzar.'];
 $('#footerHint').textContent=state.completed&&state.step===5?('Tu configuración está guardada en tu cuenta.'):hints[state.step];
 $$('[data-step]').forEach(b=>b.onclick=()=>go(Number(b.dataset.step)));
}
function heading(title,description,kicker=''){return `<div class="heading">${kicker?`<p class="eyebrow">${kicker}</p>`:''}<h1 id="viewTitle" tabindex="-1">${title}</h1><p>${description}</p></div>`;}
function scene(){return `<div class="scene" aria-label="Isotipo de Startupia con profundidad tridimensional"><div class="scene-halo"></div><div class="scene-halo second"></div><div class="scene-core"><img class="logo-layer extrude" src="assets/startupia-isotipo.webp" alt=""><img class="logo-layer" src="assets/startupia-isotipo.webp" alt="Isotipo Startupia"><img class="logo-layer gloss" src="assets/startupia-isotipo.webp" alt=""></div>${Array.from({length:24},(_,i)=>`<i class="orbital-particle" style="--angle:${i*15}deg;--radius:${83+(i%4)*6}px;--duration:${3+(i%6)}s;--delay:${-(i%4)}s"></i>`).join('')}</div>`;}
function renderWelcome(){return `<section class="welcome"><div class="welcome-copy"><div class="welcome-label"><span class="live-dot"></span> TU PRÓXIMO CAPÍTULO</div><h1 id="viewTitle" tabindex="-1">Tu próximo <br>gran comienzo <br><em>empieza aquí.</em></h1><p class="welcome-description">La ambición ya la tienes. <br>Ahora, démosle un lugar para avanzar.</p><div class="welcome-note"><span class="welcome-note-icon">✧</span><span>Unos minutos para conocerte.<br><strong>Un espacio pensado para ti.</strong></span></div><button type="button" class="primary welcome-start" id="welcomeStart">Personalizar mi espacio <span class="arrow">↗</span></button></div><div class="welcome-art"><div class="art-coordinate">STARTUPIA / FOUNDER EDITION <span>01</span></div><div class="art-grid" aria-hidden="true"></div><div class="art-orbit orbit-a" aria-hidden="true"></div><div class="art-orbit orbit-b" aria-hidden="true"></div><div class="glass-monolith">${scene()}</div><div class="floating-tag tag-one"><span>◇</span><div><small>EL PUNTO DE PARTIDA</small><strong>Una idea con potencial.</strong></div><i></i></div><div class="floating-tag tag-two"><span>↗</span><div><small>EL SIGUIENTE CAPÍTULO</small><strong>Una dirección más clara.</strong></div></div><div class="art-footnote"><span class="live-dot"></span> GRANDES IDEAS. PASOS CONCRETOS.</div><span class="art-star star-a" aria-hidden="true">✧</span><span class="art-star star-b" aria-hidden="true">+</span></div></section><div class="welcome-route">${[['01','Tu punto de partida','Entender dónde estás.'],['02','Lo que quieres lograr','Elegir dónde enfocar.'],['03','Tu siguiente paso','Darle forma a tu espacio.']].map((x,i)=>`<div class="route-piece stagger" style="--i:${i*90+120}ms"><span>${x[0]}</span><div><strong>${x[1]}</strong><small>${x[2]}</small></div>${i<2?'<i>↗</i>':'<i>✦</i>'}</div>`).join('')}</div>`;}
const drawings={
 idea:'<path d="M8 15c-2-1-3-3-3-5a7 7 0 0 1 14 0c0 2-1 4-3 5l-1 3H9l-1-3Z"/><path d="M9 21h6M12 6v6m-2-2 2 2 2-2"/>',
 validation:'<path d="M5 20v-6h3v6m3 0V9h3v11m3 0V4h3v16"/>',
 mvp:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M3 8l9 5m0 0v9M7.5 5.5l9 5"/>',
 clients:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5v2"/>',
 traction:'<path d="M3 20h18M4 16l5-6 5 3 7-9m-6 0h6v6"/>',
 exploring:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
 validate:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8m-1-2v3h3"/>',
 build:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M3 8l9 5m0 0v9"/>',
 customers:'<path d="M3 18a5 5 0 0 1 10 0v3H3v-3Z"/><circle cx="8" cy="8" r="3"/><path d="M15 10h7m-3-3 3 3-3 3M17 17h5"/>',
 organize:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 15h7m-7 5h7"/>',
 decide:'<path d="m10 2 2.5 6.5L19 11l-6.5 2.5L10 20l-2.5-6.5L1 11l6.5-2.5L10 2Zm9 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
 grow:'<path d="M3 20h18M6 16v-4m6 4V8m6 8V4"/>'
};
function icon(id){return `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[id]||drawings.exploring}</svg>`;}
function choice(item,type,index){const active=type==='stage'?state.stage===item.id:state.goals.includes(item.id);return `<button type="button" class="choice-card stagger ${active?'selected':''}" style="--i:${index*55}ms" data-${type}="${item.id}" aria-pressed="${active}"><span class="module-icon">${icon(item.id)}</span><span class="card-number">${String(index+1).padStart(2,'0')}</span><span class="choice-copy"><strong>${item.name}</strong><small>${item.description}</small></span><span class="selection-dot" aria-hidden="true"></span></button>`;}
function renderStage(){return heading('Todo gran camino<br>tiene <em>un punto de partida.</em>','¿En qué etapa estás hoy? No hay una respuesta mejor que otra.')+`<div class="content-grid">${stages.map((s,i)=>choice(s,'stage',i)).join('')}</div><div class="step-note stagger" style="--i:340ms"><span class="spark">✧</span><span>No necesitas tenerlo todo resuelto. Tu etapa nos da contexto; no limita lo que puedes construir.</span></div>`;}
const sectors=['Tecnología y SaaS','Comercio y e-commerce','Educación','Salud y bienestar','Servicios profesionales','Alimentos y bebidas','Finanzas','Sostenibilidad','Economía creativa','Otro / por definir'];
function field(id,label,options={}){const {placeholder='',optional=false,max=80,full=false}=options;return `<div class="field ${full?'full':''}" id="field-${id}"><label for="${id}">${label}${optional?'<span class="optional">Opcional</span>':''}</label><input id="${id}" name="${id}" type="text" value="${escape(state[id])}" placeholder="${placeholder}" maxlength="${max}" ${optional?'':'required'} autocomplete="${id==='founder'?'given-name':id==='startup'?'organization':'off'}" aria-describedby="${id}-error"><span class="field-error" id="${id}-error"></span></div>`;}
function renderDetails(){return heading('Pongámosle contexto <em>a tu idea.</em>','Cuéntanos lo esencial. Puedes empezar con una versión sencilla y mejorarla después.')+`<div class="details-layout"><form id="startupForm" novalidate><div class="form-grid">${field('founder','¿Cómo te llamas?',{placeholder:'Tu nombre',max:40})}${field('startup','Nombre de tu startup',{placeholder:'Puede ser un nombre provisional',max:60})}<div class="field full" id="field-sector"><label for="sector">Industria o sector</label><select id="sector" name="sector" required aria-describedby="sector-error"><option value="">Selecciona una industria</option>${sectors.map(s=>`<option value="${escape(s)}" ${state.sector===s?'selected':''}>${s}</option>`).join('')}</select><span class="field-error" id="sector-error"></span></div><div class="field full" id="field-idea"><label for="idea">Tu idea, en pocas palabras</label><textarea id="idea" name="idea" placeholder="Ayudamos a [personas] a resolver [problema] con [solución]." maxlength="300" required aria-describedby="idea-help idea-error">${escape(state.idea)}</textarea><div class="field-meta"><span id="idea-help">Una frase clara es suficiente para empezar.</span><span id="ideaCount">${state.idea.length}/300</span></div><span class="field-error" id="idea-error"></span></div>${field('problem','¿Qué problema vas a resolver?',{placeholder:'Describe un problema concreto que hayas observado',full:true,max:400})}${field('audience','¿A quién quieres ayudar?',{placeholder:'Ej. Pequeños negocios que venden por Instagram',full:true,max:120})}${field('difficulty','¿Cuál es tu principal dificultad?',{placeholder:'Qué te impide avanzar hoy',optional:true,full:true,max:400})}<div class="field full"><label>¿Cómo estás construyendo?</label><div class="segmented" role="group" aria-label="Tamaño del equipo"><button type="button" data-team="solo" class="${state.team==='solo'?'active':''}" aria-pressed="${state.team==='solo'}">Por mi cuenta</button><button type="button" data-team="small" class="${state.team==='small'?'active':''}" aria-pressed="${state.team==='small'}">Somos 2–5</button><button type="button" data-team="team" class="${state.team==='team'?'active':''}" aria-pressed="${state.team==='team'}">Somos 6 o más</button></div></div></div><div class="form-bottom"><span class="field-help">¿Todavía no tienes una idea definida?<br>Un nombre provisional y un problema bastan.</span><button type="button" class="use-example" id="exampleFill">Ver un ejemplo ↗</button></div></form><aside class="context-card stagger" style="--i:130ms"><img class="mini-logo" src="assets/startupia-isotipo.webp" alt=""><p class="eyebrow" style="font-size:8px;margin-bottom:12px;color:#67b4b4">UN CONTEXTO COMPARTIDO</p><h3>Cuanto mejor entendemos tu punto de partida,<br><span class="gradient-text">más sentido tiene el siguiente paso.</span></h3><p>Tu idea, tu cliente y tus prioridades conectan la investigación con la ejecución.</p><div class="context-line"></div></aside></div>`;}
function renderGoals(){return heading('No todo a la vez.<br><em>Lo que más te importa ahora.</em>','Elige hasta tres prioridades. La primera que selecciones será tu enfoque principal.')+`<div class="selection-count"><b id="goalCount">${state.goals.length} de 3</b> prioridades seleccionadas <span id="primaryGoal">${state.goals.length?'· Principal: '+goals.find(g=>g.id===state.goals[0]).name:''}</span></div><div class="content-grid goal-grid">${goals.map((g,i)=>choice(g,'goal',i)).join('')}</div><div class="step-note"><span class="spark">◷</span><div><span>¿Cuánto tiempo puedes dedicarle por semana?</span><div class="segmented" role="group" aria-label="Horas disponibles por semana" style="margin-top:10px"><button data-time="2" type="button" class="${state.time==='2'?'active':''}" aria-pressed="${state.time==='2'}">1–3 horas</button><button data-time="5" type="button" class="${state.time==='5'?'active':''}" aria-pressed="${state.time==='5'}">4–7 horas</button><button data-time="10" type="button" class="${state.time==='10'?'active':''}" aria-pressed="${state.time==='10'}">8 horas o más</button></div></div></div>`;}
function previewCard(){const m=modules[previewModule];return `<div class="preview-bar"><div class="preview-dots"><i></i><i></i><i></i></div><span>STARTUPIA OS / TU ESPACIO</span><span style="color:#477d7b">✧</span></div><div class="preview-body"><div class="preview-mini-sidebar"><img src="assets/startupia-isotipo.webp" alt=""><span>⌂</span><span>▦</span><span>◇</span><span>✧</span></div><div class="preview-content"><h2 class="preview-greeting">Hola, ${escape(state.founder||'founder')} <span style="color:#31dac1">✦</span></h2><p>Un nuevo comienzo para ${escape(state.startup||'tu startup')}.</p><p>${state.team==='solo'?'Tu proyecto personal':state.team==='small'?'Tu equipo de 2–5 personas':'Tu equipo de 6 o más personas'} · ${state.time==='2'?'1–3':state.time==='5'?'4–7':'8+'} h / semana</p><div class="preview-chips"><span>${escape(selectedStage().name)}</span><span>Tu contexto conectado</span></div><div class="preview-action stagger"><small>${m.tag.toUpperCase()}</small><h3>${m.title}</h3><p>${m.description}</p>${state.audience?`<p>Tu cliente: ${escape(state.audience)}</p>`:''}</div><div class="preview-task stagger" style="--i:100ms">${m.task}</div><div class="preview-task stagger" style="--i:160ms">${escape(selectedStage().task)}</div></div></div><div class="preview-label">VISTA PREVIA DE TU ESPACIO · PERSONALIZADA CON TUS RESPUESTAS</div>`;}
function renderPreview(){return heading('Un espacio para <em>conectar las piezas.</em>','Tus respuestas empiezan a darle forma. Explora lo que aporta cada herramienta.')+`<div class="preview-layout"><div class="workspace-preview stagger" id="previewCard">${previewCard()}</div><div class="preview-aside"><p class="eyebrow">CUATRO HERRAMIENTAS. TU CONTEXTO.</p><div class="module-list">${Object.entries(modules).map(([id,m],i)=>`<button type="button" class="module-tab stagger ${id===previewModule?'active':''}" style="--i:${100+i*50}ms" data-module="${id}" aria-pressed="${id===previewModule}"><span>${m.icon}</span><span style="flex:1"><strong>${m.name}</strong><small>${{manager:'Organiza y ejecuta',operators:'Investiga antes de decidir',mvp:'Enfoca tu primera versión',copilot:'Contrasta tus decisiones'}[id]}</small></span><span>↗</span></button>`).join('')}</div><p>Lo que investigas te ayuda a decidir. Lo que decides se convierte en acciones.</p></div></div><div class="step-note"><span class="spark">◎</span><span>Tu primer enfoque: <strong style="font-weight:500;color:#b0dfd9">${escape(goals.find(g=>g.id===state.goals[0])?.name||'Definir tu próximo paso')}</strong>. Empieza pequeño, aprende y ajusta el rumbo.</span></div>`;}
function reviewRow(label,value,step){return `<div class="review-row"><div><small>${label}</small><strong>${escape(value)}</strong></div><button class="edit-button" data-edit="${step}" aria-label="Editar ${label.toLowerCase()}">Editar ↗</button></div>`;}
function renderReview(){return heading(`${escape(state.founder||'Founder')}, tu siguiente capítulo<br><em>empieza con una decisión.</em>`,'Revisa tu punto de partida. No necesitas tener todo el camino resuelto para dar el primer paso.')+`<div class="review-layout"><div class="review-card stagger"><div class="review-card-top"><div class="review-avatar">${escape((state.startup||'S').slice(0,2).toUpperCase())}</div><div><h3>${escape(state.startup||'Tu startup')}</h3><small>${escape(state.sector||'Sector por definir')}</small></div></div>${reviewRow('TU PUNTO DE PARTIDA',selectedStage().name,1)}${reviewRow('TU IDEA',state.idea.length>110?state.idea.slice(0,107)+'…':state.idea,2)}${reviewRow('TU ENFOQUE',state.goals.map(id=>goals.find(g=>g.id===id)?.name).join(' · '),3)}</div><div class="ready-panel stagger" style="--i:150ms"><div class="ready-mark"><img src="assets/startupia-isotipo.webp" alt="Isotipo Startupia"></div><h3>Una gran ambición.<br>Un comienzo <span class="gradient-text">a tu medida.</span></h3><ul class="ready-list"><li class="stagger" style="--i:250ms"><i>✓</i> Tu contexto, en un solo lugar</li><li class="stagger" style="--i:320ms"><i>✓</i> Tu etapa y prioridades definidas</li><li class="stagger" style="--i:390ms"><i>✓</i> Una primera acción para avanzar</li></ul><div class="completion-line" aria-hidden="true" style="grid-column:1/-1"></div></div></div>${state.completed?`<div class="final-status" role="status"><strong>Tu comienzo ya tiene dirección.</strong> ${storageAvailable?'Configuración guardada en tu cuenta.':'Configuración completada durante esta visita.'} Puedes seguir revisando tus respuestas.</div>`:''}`;}
function render(direction=1,focus=false){
 document.body.dataset.theme=[1,3,5].includes(state.step)?'light':'dark';
 document.body.dataset.step=String(state.step);
 $('meta[name="theme-color"]').content=[1,3,5].includes(state.step)?'#f8fafc':'#061429';
 const templates=[renderWelcome,renderStage,renderDetails,renderGoals,renderPreview,renderReview];
 $('#view').className='view';$('#view').innerHTML=templates[state.step]();void $('#view').offsetWidth;$('#view').classList.add(direction<0?'backward':'enter');
 nav();$('#chapterNumber').textContent=String(state.step+1).padStart(2,'0');$('#journeyProgress').style.width=((state.step+1)/6*100)+'%';bindView();bindEffects();
 if(focus){$('#viewTitle').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
function firstIncomplete(target){
 if(target>1&&!state.stage)return 1;
 if(target>2&&(state.founder.trim().length<2||state.startup.trim().length<2||!sectors.includes(state.sector)||state.idea.trim().length<15||state.problem.trim().length<10||!state.audience.trim()))return 2;
 if(target>3&&!state.goals.length)return 3;
 return -1;
}
function go(index){
 if(isTransitioning||index===state.step||index<0||index>state.furthest)return;
 if(index>state.step&&!validate())return;
 const incomplete=firstIncomplete(index);
 if(incomplete>=0&&index>state.step){state.step=incomplete;save();render(1,true);validate();return;}
 const direction=index-state.step;state.step=index;save();render(direction,true);
}
function validate(){
 if(state.step===1&&!state.stage){toast('Elige la etapa que mejor describe tu momento.');return false;}
 if(state.step===3&&!state.goals.length){toast('Elige al menos una prioridad para tu comienzo.');return false;}
 if(state.step!==2)return true;
 const errors={};
 if(state.founder.trim().length<2)errors.founder='Escribe tu nombre para personalizar tu espacio.';
 if(state.startup.trim().length<2)errors.startup='Escribe un nombre, aunque sea provisional.';
 if(!sectors.includes(state.sector))errors.sector='Selecciona una industria o elige «Otro / por definir».';
 if(state.problem.trim().length<10)errors.problem='Describe el problema en al menos 10 caracteres.';
 if(!state.audience.trim())errors.audience='Especifica quién tiene este problema.';
 if(state.idea.trim().length<15)errors.idea='Describe el problema y cómo te gustaría resolverlo.';
 for(const id of ['founder','startup','sector','idea','problem','audience']){$('#field-'+id).classList.toggle('invalid',!!errors[id]);$('#'+id+'-error').textContent=errors[id]||'';$('#'+id).setAttribute('aria-invalid',String(!!errors[id]));}
 const ids=Object.keys(errors);if(ids.length){$('#'+ids[0]).focus();return false;}
 for(const id of ['founder','startup','idea','problem','audience','difficulty'])state[id]=state[id].trim();save();return true;
}
function invalidateCompletion(){state.completed=false;}
function bindView(){
 if($('#welcomeStart'))$('#welcomeStart').onclick=next;
 $$('[data-stage]').forEach(b=>b.onclick=()=>{if(state.stage!==b.dataset.stage)invalidateCompletion();state.stage=b.dataset.stage;save();updateChoices('stage');nav();});
 if($('#startupForm')){
   $('#startupForm').onsubmit=e=>{e.preventDefault();next();};
   for(const id of ['founder','startup','sector','idea','problem','audience','difficulty']){
    $('#'+id).addEventListener(id==='sector'?'change':'input',e=>{state[id]=e.target.value;invalidateCompletion();save();if(id==='idea')$('#ideaCount').textContent=state.idea.length+'/300';const f=$('#field-'+id);if(f){f.classList.remove('invalid');$('#'+id+'-error').textContent='';$('#'+id).setAttribute('aria-invalid','false');}});
   }
   $$('[data-team]').forEach(b=>b.onclick=()=>{state.team=b.dataset.team;invalidateCompletion();save();updateSegment('team');});
   $('#exampleFill').onclick=()=>{showDialog('UN EJEMPLO PARA INSPIRARTE','Así de sencillo puede ser.',`<p>«Ayudamos a pequeños negocios de comida a recibir pedidos sin perder conversaciones, mediante un enlace con su menú y pedidos organizados».</p><p>Empieza por quién tiene el problema, qué le cuesta hacer y cómo te gustaría ayudarle. Tu propia idea puede ser completamente diferente.</p><button class="primary" id="dialogDone">Entendido <span>↗</span></button>`);};
 }
 $$('[data-goal]').forEach(b=>b.onclick=()=>{const id=b.dataset.goal,i=state.goals.indexOf(id);if(i>=0)state.goals.splice(i,1);else{if(state.goals.length>=3){toast('Elige hasta tres prioridades. Quita una para añadir otra.');return;}state.goals.push(id);}invalidateCompletion();save();updateChoices('goal');$('#goalCount').textContent=state.goals.length+' de 3';$('#primaryGoal').textContent=state.goals.length?'· Principal: '+goals.find(g=>g.id===state.goals[0]).name:'';nav();});
 $$('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time;invalidateCompletion();save();updateSegment('time');});
 $$('[data-module]').forEach(b=>b.onclick=()=>{previewModule=b.dataset.module;$$('[data-module]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#previewCard').innerHTML=previewCard();});
 $$('[data-edit]').forEach(b=>b.onclick=()=>go(Number(b.dataset.edit)));
}
function updateChoices(type){$$('[data-'+type+']').forEach(x=>{const s=type==='stage'?x.dataset.stage===state.stage:state.goals.includes(x.dataset.goal);x.classList.toggle('selected',s);x.setAttribute('aria-pressed',String(s));});}
function updateSegment(key){$$('[data-'+key+']').forEach(x=>{const selected=x.dataset[key]===state[key];x.classList.toggle('active',selected);x.setAttribute('aria-pressed',String(selected));});}
async function next(){
 if(isTransitioning||!validate())return;
 if(state.step===5){
   if(state.completed){location.assign('/os');return;}
   const incomplete=firstIncomplete(5);if(incomplete>=0){state.step=incomplete;save();render(-1,true);validate();return;}
   isTransitioning=true;$('#next').disabled=true;$('#nextLabel').textContent='Preparando tu workspace…';
   try{await persist(true);state.completed=true;dirty=false;render(1,false);confetti();toast('Tu startup y tus prioridades están guardadas. Ya puedes entrar a Startupia OS.');}
   catch(error){toast(error.message||'No se pudo finalizar. Tu información permanece en esta pantalla.');}
   finally{isTransitioning=false;$('#next').disabled=false;if(!state.completed)$('#nextLabel').textContent='Volver a guardar';}
   return;
 }
 isTransitioning=true;
 state.step++;state.furthest=Math.max(state.furthest,state.step);
 if(state.step===4)previewModule=goals.find(g=>g.id===state.goals[0])?.module||'manager';
 save();render(1,true);setTimeout(()=>{isTransitioning=false;},200);
}
$('#next').onclick=next;$('#back').onclick=()=>go(state.step-1);
$('#motionToggle').onclick=()=>{reduced=!reduced;applyMotion();try{localStorage.setItem('startupia-motion',reduced?'reduced':'full');}catch(e){}toast(reduced?'Movimiento reducido. Puedes activarlo cuando quieras.':'Movimiento activado.');};
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{let preference=null;try{preference=localStorage.getItem('startupia-motion');}catch(err){}if(preference===null){reduced=e.matches;applyMotion();}});
function showDialog(kicker,title,content){$('#dialogKicker').textContent=kicker;$('#dialogContent').innerHTML=`<h2>${title}</h2>${content}`;$('#infoDialog').showModal();if($('#dialogDone'))$('#dialogDone').onclick=()=>$('#infoDialog').close();}
$('#dialogClose').onclick=()=>$('#infoDialog').close();
$('#infoDialog').addEventListener('click',e=>{if(e.target===$('#infoDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#helpOpen').onclick=()=>showDialog('AQUÍ PARA ORIENTARTE','Este comienzo es tuyo.',`<div class="help-items"><div class="help-item"><strong>Tu cuenta ya tiene su lugar</strong><p>Aquí personalizas tu experiencia: tu etapa, tu idea y las prioridades que quieres trabajar primero.</p></div><div class="help-item"><strong>¿No tienes una idea definida?</strong><p>Elige «Estoy explorando». Puedes usar un nombre provisional y describir un problema que te gustaría investigar.</p></div><div class="help-item"><strong>¿Puedes cambiar de opinión?</strong><p>Sí. Usa «Volver», la navegación lateral o los enlaces «Editar» de la revisión final. Tu proyecto también puede evolucionar.</p></div><div class="help-item"><strong>¿Qué ocurre al terminar?</strong><p>Se conserva tu configuración en tu cuenta y se confirma el final del recorrido. Puedes seguir revisándola desde aquí.</p></div></div><button class="primary" id="dialogDone">Seguir mi recorrido <span>↗</span></button>`);
$('#privacyOpen').onclick=()=>{showDialog('TUS DATOS','Tu contexto sigue siendo tuyo.',`<p>Las respuestas de este onboarding se guardan únicamente en el almacenamiento local de tu cuenta. Se guardan en tu cuenta de Startupia y se sincronizan con tu workspace. Solo tu sesión puede consultar tu progreso.</p><p>En un equipo compartido, otras personas con acceso a este navegador podrían ver el progreso guardado. Puedes eliminarlo cuando quieras. Si tu navegador bloquea el almacenamiento, el progreso se conservará solo durante esta visita.</p><button class="danger-button" id="resetOpen">Eliminar mis respuestas y empezar de nuevo</button>`);$('#resetOpen').onclick=()=>{$('#infoDialog').close();showDialog('EMPEZAR DE NUEVO','¿Quieres borrar este comienzo?',`<p>Se eliminarán la información de tu startup y las preferencias guardadas por este onboarding en tu cuenta.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="danger-button" id="resetConfirm">Sí, borrar mis respuestas</button><button class="text-button" id="resetCancel">Conservar mi progreso</button></div>`);$('#resetCancel').onclick=()=>$('#infoDialog').close();$('#resetConfirm').onclick=()=>{try{localStorage.removeItem(STORAGE);}catch(e){}state=fresh();dirty=true;save();$('#infoDialog').close();render(1,true);$('#saveStatus').textContent='Tu progreso, a tu ritmo';toast('Puedes empezar de nuevo. Tus respuestas se han eliminado.');};};};
function bindEffects(){
 $$('.glass-monolith,.choice-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--mx',x*100+'%');card.style.setProperty('--my',y*100+'%');if(card.classList.contains('glass-monolith')){card.style.setProperty('--tx',(y-.5)*-3+'deg');card.style.setProperty('--ty',(x-.5)*4+'deg');}});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--tx','0deg');card.style.setProperty('--ty','0deg');});
 });
 const sceneEl=$('.scene');if(sceneEl){sceneEl.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=sceneEl.getBoundingClientRect();const core=$('.scene-core');core.style.setProperty('--rx',((e.clientY-r.top)/r.height-.5)*-30+'deg');core.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*35+'deg');});sceneEl.addEventListener('pointerleave',()=>{$('.scene-core').style.setProperty('--rx','0deg');$('.scene-core').style.setProperty('--ry','0deg');});}
}
document.addEventListener('click',e=>{const b=e.target.closest('.primary,.glass-monolith,.choice-card');if(!b||reduced||b.disabled)return;const r=b.getBoundingClientRect(),ripple=document.createElement('span');ripple.className='ripple';ripple.style.left=(e.clientX-r.left-75)+'px';ripple.style.top=(e.clientY-r.top-75)+'px';b.append(ripple);setTimeout(()=>ripple.remove(),750);});
const starFragment=document.createDocumentFragment();
for(let i=0;i<80;i++){const s=document.createElement('i');s.className='star';s.style.cssText=`left:${(i*37.37)%100}%;top:${(i*23.61)%100}%;--twinkle:${3+i%7}s;--drift:${20+i%13}s;--delay:-${i%9}s`;starFragment.append(s);}$('#stars').append(starFragment);
let confettiFrame;
function confetti(){
 if(reduced)return;const canvas=$('#celebration'),ctx=canvas.getContext('2d');if(!ctx)return;
 cancelAnimationFrame(confettiFrame);canvas.width=innerWidth;canvas.height=innerHeight;
 const particles=Array.from({length:84},(_,i)=>({x:innerWidth*.58,y:innerHeight*.78,vx:(Math.random()-.5)*14,vy:-5-Math.random()*12,size:2+Math.random()*4,angle:Math.random()*6,color:['#13e3cc','#0788f8','#a5ffed','#5ea5d5'][i%4]}));
 const start=performance.now();let last=start;
 function draw(now){const delta=Math.min((now-last)/16.67,2);last=now;ctx.clearRect(0,0,canvas.width,canvas.height);const age=(now-start)/1000;for(const p of particles){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=.18*delta;p.angle+=.08*delta;ctx.save();ctx.globalAlpha=Math.max(0,1-age/3.2);ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.65);ctx.restore();}if(age<3.2)confettiFrame=requestAnimationFrame(draw);else ctx.clearRect(0,0,canvas.width,canvas.height);}
 confettiFrame=requestAnimationFrame(draw);
}
const banner=document.createElement('div');banner.id='syncError';banner.className='onboarding-sync-error';banner.hidden=true;banner.innerHTML='<span></span><button type="button">Reintentar</button>';$('#main').prepend(banner);banner.querySelector('button').onclick=()=>!loaded?boot():syncConflict?location.reload():persist(false).catch(()=>{});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('startupia-motion-change',event=>{reduced=event.detail.reduced;applyMotion();});
async function boot(){
 $('#view').innerHTML='<p role="status" style="padding:60px 0">Recuperando tu comienzo…</p>';$('#next').disabled=true;
 try{
  const response=await fetch('/api/onboarding',{cache:'no-store',signal:AbortSignal.timeout(15000)}),data=await response.json();
  if(response.status===401){location.assign('/access?next=/onboarding');return;}
  if(!response.ok)throw Error(data.error||'No pudimos recuperar tu progreso.');
  if(data.state)state={...fresh(),...data.state,completed:data.completed};
  serverVersion=data.version;loaded=true;
  const incomplete=firstIncomplete(state.step);if(incomplete>=0){state.step=incomplete;state.completed=false;}
  if(state.step===4)previewModule=goals.find(g=>g.id===state.goals[0])?.module||'manager';
  render();$('#saveStatus').textContent=data.state?'Progreso recuperado de tu cuenta':'Tu comienzo se guarda en tu cuenta';
 }catch(error){$('#view').innerHTML='<h1>No pudimos recuperar tu progreso.</h1><p>Tu información guardada sigue protegida. Reintenta la conexión.</p><button class="primary" id="retryBoot">Reintentar</button>';$('#retryBoot').onclick=boot;syncError(error.message);}
}
boot();
})();
