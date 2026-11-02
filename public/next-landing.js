(() => {
 'use strict';
 const $=(selector,scope=document)=>scope.querySelector(selector);
 const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
 const root=document.documentElement;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let preference='';try{preference=localStorage.getItem('startupia-motion')||''}catch{}
 let reduced=media.matches||preference==='reduced';
 const motionButton=$('#motion-toggle');
 const hero=$('.hero');
 let heroVisible=true,starFrame=0,scrollFrame=0,lastFrame=0;
 let pointer={x:0,y:0},smoothed={x:0,y:0};
 let canvas,context,width=0,height=0,stars=[],starPhase=0;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const scrollScenes=$$('[data-scroll-scene]');
 function stopSky(){cancelAnimationFrame(starFrame);starFrame=0;lastFrame=0}
 function mayAnimate(){return !reduced&&!document.hidden&&heroVisible}
 function startSky(){if(context&&!starFrame&&mayAnimate())starFrame=requestAnimationFrame(drawSky)}
 function updateMotion(){
  reduced=media.matches||preference==='reduced';
  root.classList.toggle('reduce-motion',reduced);
  root.classList.toggle('has-motion',!reduced&&'IntersectionObserver' in window);
  motionButton.setAttribute('aria-pressed',String(reduced));
  motionButton.textContent=reduced?'◌ Movimiento reducido':'◌ Reducir movimiento';
  motionButton.disabled=media.matches;
  motionButton.title=media.matches?'Tu navegador solicita movimiento reducido.':'Puedes cambiar esta preferencia cuando quieras.';
  if(reduced){stopSky();hero.style.removeProperty('--pointer-x');hero.style.removeProperty('--pointer-y');drawStaticSky()}
  else startSky();
  updateSceneProgress();
  document.dispatchEvent(new CustomEvent('startupia-motion-change',{detail:{reduced}}));
 }
 motionButton.addEventListener('click',()=>{preference=reduced?'full':'reduced';try{localStorage.setItem('startupia-motion',preference)}catch{}updateMotion()});
 media.addEventListener('change',updateMotion);
 window.addEventListener('storage',event=>{if(event.key==='startupia-motion'){preference=event.newValue||'';updateMotion()}});
 // Menu is an inline disclosure, not a modal: normal page navigation remains available.
 const menuButton=$('.menu-toggle'),mobileNav=$('#mobile-nav');
 function menu(open,returnFocus=false){menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');mobileNav.hidden=!open;if(returnFocus)menuButton.focus()}
 menuButton.addEventListener('click',()=>menu(menuButton.getAttribute('aria-expanded')!=='true'));
 mobileNav.addEventListener('click',event=>{if(event.target.closest('a'))menu(false)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden)menu(false,true)});
 const desktop=matchMedia('(min-width:641px)');desktop.addEventListener('change',event=>{if(event.matches)menu(false)});
 // This panel describes actual product roles. It never claims a business action was executed.
 const modules={
  workspace:{kicker:'TU MEMORIA DE TRABAJO',title:'Lo que construyes, conectado.',description:'Documentos, proyectos, tareas y decisiones comparten el contexto de tu startup. Organiza el siguiente paso sin perder lo que ya aprendiste.',input:'TU CONTEXTO',output:'TRABAJO CONECTADO',chips:['Documentos','Proyectos','Tareas'],href:'/product',link:'Conocer el workspace'},
  copilot:{kicker:'UNA CONVERSACIÓN CON CONTEXTO',title:'Piensa con más perspectiva.',description:'Consulta el contexto autorizado de tu startup y revisa propuestas de análisis o trabajo. Las capacidades disponibles dependen del plan y del estado del servicio.',input:'IDEA + EVIDENCIA',output:'PROPUESTAS POR REVISAR',chips:['Contexto autorizado','Análisis','Revisión'],href:'/product',link:'Conocer el Copilot'},
  operators:{kicker:'FOCO PARA CADA DECISIÓN',title:'Una especialidad. Un reto claro.',description:'Trabaja con enfoques para investigar, preparar entrevistas, definir el MVP o revisar una oferta. Conserva la procedencia y decide qué propuestas aplicar.',input:'TU RETO',output:'UN SIGUIENTE PASO',chips:['Entrevistas','MVP','Revisión comercial'],href:'/plans/build',link:'Explorar las herramientas de Build'},
  growth:{kicker:'DE LAS SUPOSICIONES A LAS SEÑALES',title:'Crece con evidencia.',description:'Conecta experimentos, métricas y clientes con el contexto que ya construiste. Los datos registrados no se presentan como ingresos o demanda demostrados.',input:'UNA HIPÓTESIS',output:'APRENDIZAJE REGISTRADO',chips:['Experimentos','Métricas','Clientes'],href:'/plans/growth',link:'Conocer Growth'},
  mentors:{kicker:'UNA MIRADA CON EXPERIENCIA',title:'La perspectiva también es humana.',description:'Comparte el reto que necesitas trabajar y solicita disponibilidad. Cada sesión requiere confirmar perfil, condiciones y horario; una solicitud no equivale a una reserva.',input:'TU CONTEXTO',output:'ORIENTACIÓN HUMANA',chips:['Reto concreto','Disponibilidad','Confirmación'],href:'/mentors',link:'Explorar Startupia Mentors'}
 };
 const tabs=$$('[data-module]'),panel=$('#module-panel');
 let panelTimer=0;
 function activateModule(tab,moveFocus=false){
  const key=tab.dataset.module,content=modules[key];if(!content)return;
  tabs.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});
  panel.setAttribute('aria-labelledby',tab.id);panel.dataset.module=key;
  const readout=$('#module-readout');readout.replaceChildren(...key.toUpperCase().split('').map((letter,index)=>{const span=document.createElement('span');span.className='flap-letter'+(reduced?'':' is-flipping');span.style.setProperty('--letter-index',String(index));span.textContent=letter;return span}));
  $('#module-kicker').textContent=content.kicker;$('#module-title').textContent=content.title;$('#module-description').textContent=content.description;
  $('#map-input').textContent=content.input;$('#map-output').textContent=content.output;
  const link=$('#module-link');link.href=content.href;link.replaceChildren(document.createTextNode(content.link+' '));const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(arrow);
  const chips=$('#module-chips');chips.replaceChildren(...content.chips.map(text=>{const span=document.createElement('span');span.textContent=text;return span}));
  clearTimeout(panelTimer);panel.classList.remove('is-switching');
  if(!reduced&&panel.animate)panel.animate([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.18,.75,.25,1)'});
  if(moveFocus)tab.focus();
 }
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateModule(tab));tab.addEventListener('keydown',event=>{let next=index;if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();activateModule(tabs[next],true)})});
 // Local orientation. User text is never placed in HTML, stored or sent over the network.
 const form=$('#focus-form'),result=$('#focus-result'),audience=$('#focus-audience'),problem=$('#focus-problem');
 let lastCount=-1;
 function countAnswers(){audience.setCustomValidity('');problem.setCustomValidity('');const count=Number(!!$('input[name="stage"]:checked',form))+Number(audience.value.trim().length>=3)+Number(problem.value.trim().length>=10);if(count!==lastCount){$('#focus-count').textContent=count+' / 3';lastCount=count}}
 form.addEventListener('input',countAnswers);form.addEventListener('change',countAnswers);
 const focusGuides={
  idea:{title:'Empieza por una conversación real.',copy:'Tu primera prueba puede ser pequeña. Busca entender el problema antes de decidir una solución.',steps:['Escribe una hipótesis sobre cuándo aparece este problema.','Prepara preguntas abiertas y habla con personas del público que definiste.','Registra ejemplos concretos y decide qué necesitas comprobar después.'],plan:'build'},
  building:{title:'Haz tu siguiente prueba más pequeña.',copy:'Un MVP sirve para aprender. Recorta el alcance alrededor de una sola hipótesis observable.',steps:['Elige el comportamiento que necesitas observar.','Define la prueba más pequeña y un criterio antes de ejecutarla.','Registra el resultado y qué cambiarías; evita confundir actividad con demanda.'],plan:'build'},
  growing:{title:'Elige una señal que cambie tu decisión.',copy:'El siguiente ciclo necesita una hipótesis, un criterio y una medición que puedas explicar.',steps:['Describe qué crees que limita el crecimiento y por qué.','Define un experimento, una métrica y una fuente verificable.','Contrasta el resultado con el criterio y documenta el siguiente paso.'],plan:'growth'}
 };
 form.addEventListener('submit',event=>{
  event.preventDefault();countAnswers();
  if(audience.value.trim().length<3)audience.setCustomValidity('Describe a quién quieres ayudar con al menos 3 caracteres.');
  if(problem.value.trim().length<10)problem.setCustomValidity('Describe el problema con al menos 10 caracteres.');
  if(!form.reportValidity())return;
  const selected=$('input[name="stage"]:checked',form);if(!selected)return;const guide=focusGuides[selected.value];if(!guide)return;
  $('#focus-result-title').textContent=guide.title;$('#focus-result-copy').textContent=guide.copy;
  $('#focus-result-steps').replaceChildren(...guide.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
  $('#focus-result-context').textContent=audience.value.trim()+': '+problem.value.trim();
  const link=$('#focus-result-link');link.href='/checkout?plan='+guide.plan;link.textContent='Explorar '+(guide.plan==='growth'?'Growth':'Build')+' ↗';
  form.hidden=true;result.hidden=false;result.focus({preventScroll:true});
  if(!reduced&&result.animate)result.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
 });
 $('#focus-reset').addEventListener('click',()=>{result.hidden=true;form.hidden=false;const field=$('input[name="stage"]:checked',form)||$('input[name="stage"]',form);field.focus({preventScroll:true})});
 form.hidden=false;
 // Disclosures use native semantics and remain functional without script.
 $$('.faq-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open&&!reduced&&detail.animate)detail.querySelector('div').animate([{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:230,easing:'ease-out'})}));
 // Native scroll drives bounded decorative layers; it never changes scroll position.
 function updateSceneProgress(){
  hero.style.setProperty('--hero-scroll',reduced?'0':Math.min(1,Math.max(0,scrollY/hero.offsetHeight)).toFixed(3));
  scrollScenes.forEach(scene=>{const box=scene.getBoundingClientRect();const progress=reduced ? .5 :Math.min(1,Math.max(0,(innerHeight-box.top)/(innerHeight+box.height)));scene.style.setProperty('--scene-progress',progress.toFixed(3))});
 }
 function onScroll(){if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const total=document.documentElement.scrollHeight-innerHeight;const fraction=total>0?Math.min(1,Math.max(0,scrollY/total)):0;$('.reading-line span').style.transform='scaleX('+fraction+')';updateSceneProgress()})}
 window.addEventListener('resize',onScroll,{passive:true});
 // Reflections react only to a precise pointer. Focus and touch retain the full content.
 if(fine.matches)$$('.surface-reactive').forEach(surface=>{
  let frame=0,x=0,y=0;
  surface.addEventListener('pointermove',event=>{if(reduced)return;const box=surface.getBoundingClientRect();x=Math.max(-1,Math.min(1,(event.clientX-box.left)/box.width*2-1));y=Math.max(-1,Math.min(1,(event.clientY-box.top)/box.height*2-1));if(!frame)frame=requestAnimationFrame(()=>{frame=0;surface.style.setProperty('--surface-x',x.toFixed(3));surface.style.setProperty('--surface-y',y.toFixed(3))})},{passive:true});
  const reset=()=>{cancelAnimationFrame(frame);frame=0;surface.style.removeProperty('--surface-x');surface.style.removeProperty('--surface-y')};
  surface.addEventListener('pointerleave',reset,{passive:true});window.addEventListener('pagehide',reset);
 });
 // The film is an actual local video. Loading and playback are separate user actions.
 const filmLauncher=$('#film-launch'),filmDialog=$('#film-dialog'),brandVideo=$('#brand-video'),filmStatus=$('#film-status');
 const poster=$('.film-poster');
 poster.addEventListener('error',()=>filmLauncher.classList.add('has-no-poster'));
 if(poster.complete&&!poster.naturalWidth)filmLauncher.classList.add('has-no-poster');
 function closeFilm(){brandVideo.pause();if(filmDialog.open)filmDialog.close()}
 if(typeof filmDialog.showModal==='function'){
  filmLauncher.addEventListener('click',event=>{
   event.preventDefault();filmStatus.hidden=true;
   if(!brandVideo.getAttribute('src')){brandVideo.src=filmLauncher.getAttribute('href');brandVideo.load()}
   filmDialog.showModal();root.classList.add('film-is-open');
   if(!reduced&&filmDialog.animate)filmDialog.animate([{opacity:0,transform:'translateY(12px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320,easing:'cubic-bezier(.18,.75,.25,1)'});
  });
  $('#film-close').addEventListener('click',closeFilm);
  filmDialog.addEventListener('close',()=>{brandVideo.pause();root.classList.remove('film-is-open');filmLauncher.focus({preventScroll:true})});
  filmDialog.addEventListener('click',event=>{if(event.target!==filmDialog)return;const box=filmDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeFilm()});
 }
 brandVideo.addEventListener('error',()=>{filmStatus.textContent='El vídeo no está disponible en este momento. Puedes continuar explorando Startupia.';filmStatus.hidden=false});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)brandVideo.pause()});
 window.addEventListener('pagehide',()=>brandVideo.pause());
 window.addEventListener('scroll',onScroll,{passive:true});onScroll();
 // One observer reveals content once, another suspends costly work outside the hero.
 if('IntersectionObserver' in window){
  const reveals=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');reveals.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  $$('.reveal,.method-grid').forEach(element=>reveals.observe(element));
  const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;hero.classList.toggle('is-outside',!heroVisible);if(heroVisible)startSky();else stopSky()},{threshold:0});heroObserver.observe(hero);
  const sections=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const id=entry.target.id;$$('.desktop-nav a[href^="#"]').forEach(link=>{if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})})},{rootMargin:'-15% 0px -65% 0px'});
  $$('.section-observed[id]').forEach(section=>sections.observe(section));
 }
 function seed(index){const value=Math.sin(index*12.9898+78.233)*43758.5453;return value-Math.floor(value)}
 function resizeSky(){if(!canvas||!context)return;const box=hero.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);const count=innerWidth<641?40:88;stars=Array.from({length:count},(_,i)=>({x:seed(i*3+1)*width,y:seed(i*3+2)*height,size:.35+seed(i*3+3)*1.05,opacity:.13+seed(i*7+4)*.48,depth:.2+seed(i*5+8)*.8}));drawStaticSky()}
 function paintSky(phase){context.clearRect(0,0,width,height);for(let i=0;i<stars.length;i++){const star=stars[i];const x=star.x+smoothed.x*star.depth*6,y=star.y+smoothed.y*star.depth*4;const alpha=reduced?star.opacity:star.opacity*(.8+.2*Math.sin(phase*.0005+i));context.beginPath();context.fillStyle='rgba(169,220,238,'+alpha.toFixed(3)+')';context.arc(x,y,star.size,0,Math.PI*2);context.fill()}}
 function drawStaticSky(){if(context)paintSky(starPhase)}
 function drawSky(now){starFrame=0;if(!mayAnimate())return;if(now-lastFrame>32){lastFrame=now;starPhase=now;smoothed.x+=(pointer.x-smoothed.x)*.055;smoothed.y+=(pointer.y-smoothed.y)*.055;hero.style.setProperty('--pointer-x',smoothed.x.toFixed(3));hero.style.setProperty('--pointer-y',smoothed.y.toFixed(3));paintSky(now)}starFrame=requestAnimationFrame(drawSky)}
 canvas=$('#starfield');try{context=canvas.getContext('2d',{alpha:true});if(context){resizeSky();let resizeTimer=0;const queueResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeSky,120)};window.addEventListener('resize',queueResize);if('ResizeObserver' in window)new ResizeObserver(queueResize).observe(hero);if(fine.matches)hero.addEventListener('pointermove',event=>{if(reduced)return;const box=hero.getBoundingClientRect();pointer.x=(event.clientX-box.left)/box.width*2-1;pointer.y=(event.clientY-box.top)/box.height*2-1},{passive:true});hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0}},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSky();else startSky()});window.addEventListener('pagehide',stopSky);window.addEventListener('pageshow',startSky)}}catch{context=null}
 updateMotion();
})();
