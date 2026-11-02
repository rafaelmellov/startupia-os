(()=>{'use strict';
document.addEventListener('click',event=>{const el=event.target.closest('[data-plan],#mentor-open-form,[data-mentor-launch]');if(!el)return;if(el.dataset.plan&&['build','growth'].includes(el.dataset.plan.toLowerCase())){event.preventDefault();event.stopImmediatePropagation();location.assign('/checkout?plan='+el.dataset.plan.toLowerCase())}else if(el.id==='mentor-open-form'||el.hasAttribute('data-mentor-launch')){event.preventDefault();event.stopImmediatePropagation();location.assign('/mentors')}},true);
document.querySelectorAll('[data-plan]').forEach(b=>{const name=b.dataset.plan;if(['Build','Growth'].includes(name))b.setAttribute('aria-label','Explorar '+name+' y preparar mi startup')});
document.getElementById('motion-toggle')?.addEventListener('click',()=>window.StartupiaMotionV5?.setReduced(document.documentElement.classList.contains('reduce-motion')));
const nav=document.querySelector('nav.nav');if(nav){const entry=document.createElement('a');entry.href='/access';entry.className='s5-access';entry.textContent='Entrar a mi OS ↗';(nav.querySelector('.nav-links')||nav).append(entry)}
document.querySelectorAll('a[href="/os"]').forEach(a=>a.href='/access');
})();
