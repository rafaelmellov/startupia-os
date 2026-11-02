'use client';

import {useRef, useState, type FormEvent} from 'react';
import Link from '../site-link';
import {ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles} from 'lucide-react';
import {safeNext} from '../../lib/http';

export type AuthMode = 'login' | 'register' | 'reset' | 'password' | 'check';
export type AuthProps = {mode: AuthMode; plan?: string; next?: string; expired?: boolean; recovery?: boolean};
const titles = {login:'Tu próximo capítulo empieza aquí.',register:'De idea a startup. Contigo al mando.',reset:'Volvamos a conectar.',password:'Un nuevo comienzo, seguro.',check:'Revisa tu correo.'};
const descriptions = {login:'Entra a tu espacio y continúa construyendo lo que viene.',register:'Crea tu cuenta para darle contexto, foco y dirección a tu startup.',reset:'Escribe el correo de tu cuenta. Te enviaremos un enlace para recuperar el acceso.',password:'Elige una contraseña que no utilices en otros servicios.',check:'Abre el enlace que te enviamos para confirmar tu cuenta y preparar tu startup.'};

export default function AuthPage({mode, plan, next, expired, recovery}: AuthProps) {
 const [busy,setBusy]=useState(false),[error,setError]=useState(expired?'El enlace venció o no es válido. Solicita uno nuevo para continuar.':''),[success,setSuccess]=useState('');
 const [showPassword,setShowPassword]=useState(false),[showConfirmation,setShowConfirmation]=useState(false);
 const [authenticated,setAuthenticated]=useState(false);
 const destinationRef=useRef('/onboarding');
 const errorRef=useRef<HTMLDivElement>(null);
 const selectedPlan=plan==='build'||plan==='growth'?plan:null;
 const query=new URLSearchParams();if(selectedPlan)query.set('plan',selectedPlan);if(next)query.set('next',safeNext(next));
 const route=(path:string)=>path+(query.size?'?'+query.toString():'');
 async function finish(destination:string){
  if(selectedPlan){const response=await fetch('/api/plan-interest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:selectedPlan})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Tu sesión está lista, pero no pudimos guardar el plan. Vuelve a intentarlo.');}
  location.assign(safeNext(destination));
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  const values=Object.fromEntries(new FormData(event.currentTarget));
  try{
   if(authenticated){await finish(destinationRef.current);return;}
   if((mode==='register'||mode==='password')&&values.password!==values.confirmPassword)throw new Error('Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.');
   const response=await fetch('/api/auth/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:values.email,password:values.password,plan:selectedPlan,next:next? safeNext(next):selectedPlan?'/onboarding':'/os'})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'No pudimos completar la solicitud. Inténtalo de nuevo.');
   if(result.next){destinationRef.current=safeNext(result.next);setAuthenticated(true);await finish(destinationRef.current);return;}
   if(mode==='register'||mode==='reset'){const target=new URLSearchParams(query);if(mode==='reset')target.set('recovery','1');location.assign('/check-email'+(target.size?'?'+target:''));return;}
   setSuccess('Tu contraseña se actualizó. Ya puedes volver a tu espacio.');
  }catch(e){setError(e instanceof Error?e.message:'No hay conexión con el servicio. Revisa tu conexión e inténtalo de nuevo.');requestAnimationFrame(()=>errorRef.current?.focus());}finally{setBusy(false);}
 }
 const isNewPassword=mode==='register'||mode==='password';
 return <main className="auth-layout">
  <section className="auth-story" aria-label="Startupia OS">
   <Link href="/" className="auth-brand" aria-label="Startupia, inicio"><img src="/isotipo.png" alt="" width="36" height="40"/><span>startupia<span className="auth-brand-os">OS</span></span></Link>
   <div className="auth-story-main"><span className="auth-kicker"><span/> TU AMBICIÓN, CON DIRECCIÓN</span><h2>La próxima<br/>gran idea<br/>es <em>la tuya.</em></h2><p>Un espacio para pensar con claridad,<br/>construir con intención y avanzar de verdad.</p>
    <div className="auth-context-card"><div className="auth-context-heading"><span className="auth-context-icon"><Sparkles size={18}/></span><span>Tu startup, conectada<small>CONTEXTO QUE CRECE CONTIGO</small></span><span className="auth-live-dot"/></div><div className="auth-journey"><span><Check size={13}/> Idea</span><i/><span><Check size={13}/> Validación</span><i/><span className="auth-journey-next">↗ Lanzamiento</span></div><div className="auth-context-progress"><span/></div><p>Cada decisión te acerca a tu siguiente paso.</p></div>
   </div>
   <footer className="auth-story-footer"><span>MENOS RUIDO. MÁS DIRECCIÓN.</span><span>OS + MENTORS ↗</span></footer>
  </section>
  <section className="auth-panel"><div className="auth-panel-top"><Link href="/" className="auth-back"><ArrowLeft size={15}/> Volver a Startupia</Link><Link href="/help">Ayuda ↗</Link></div>
   <div className="auth-card"><span className="auth-section-label">{mode==='register'?'EMPIEZA A CONSTRUIR':mode==='login'?'BIENVENIDO DE NUEVO':'TU CUENTA, CONTIGO'}</span>
    {mode==='check'&&<span className="auth-mail-icon"><Mail size={28}/></span>}
    <h1>{titles[mode]}</h1><p className="auth-description">{mode==='check'&&recovery?'Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña.':descriptions[mode]}</p>
    {selectedPlan&&<div className="auth-plan"><span><Sparkles size={16}/> Tu elección: <strong>Startupia {selectedPlan==='build'?'Build':'Growth'}</strong></span><small>Sin cobros al crear tu cuenta.</small></div>}
    {error&&<div className="auth-error" role="alert" ref={errorRef} tabIndex={-1}>{error}{authenticated&&<span> Tu sesión sigue activa. Puedes reintentar guardar tu selección.</span>}</div>}
    {success?<div className="auth-success" role="status"><ShieldCheck size={22}/><p>{success}</p><Link className="auth-submit" href={route('/onboarding')}>Continuar <ArrowRight size={16}/></Link></div>:mode==='check'?<div className="auth-check"><ol><li>Busca el mensaje de Startupia en tu bandeja de entrada.</li><li>Si no aparece, revisa correo no deseado.</li><li>Abre el enlace desde este mismo navegador.</li></ol><Link className="auth-submit" href={route('/access')}>Volver a iniciar sesión <ArrowRight size={16}/></Link><p>¿No llegó? <Link href={route(recovery?'/forgot-password':'/register')}>{recovery?'Solicitar otro enlace':'Revisar mi correo y volver a intentar'}</Link></p></div>:<form onSubmit={submit} aria-busy={busy}>
     {mode!=='password'&&<label htmlFor="auth-email">Correo electrónico<input id="auth-email" name="email" type="email" autoComplete="email" placeholder="tu@startup.com" required maxLength={200} disabled={busy||authenticated}/></label>}
     {mode!=='reset'&&<div className="auth-field"><div className="auth-label-row"><label htmlFor="auth-password">Contraseña</label>{mode==='login'&&<Link href={route('/forgot-password')}>¿La olvidaste?</Link>}</div><div className="auth-password"><input id="auth-password" name="password" type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} placeholder={isNewPassword?'Crea una contraseña segura':'Tu contraseña'} required minLength={isNewPassword?12:1} maxLength={128} disabled={busy||authenticated} aria-describedby={isNewPassword?'auth-password-help':undefined}/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={showPassword}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{isNewPassword&&<small id="auth-password-help">Usa entre 12 y 128 caracteres.</small>}</div>}
     {isNewPassword&&<div className="auth-field"><label htmlFor="auth-confirm">Confirma tu contraseña</label><div className="auth-password"><input id="auth-confirm" name="confirmPassword" type={showConfirmation?'text':'password'} autoComplete="new-password" placeholder="Repite tu contraseña" required minLength={12} maxLength={128} disabled={busy||authenticated}/><button type="button" onClick={()=>setShowConfirmation(!showConfirmation)} aria-label={showConfirmation?'Ocultar confirmación de contraseña':'Mostrar confirmación de contraseña'} aria-pressed={showConfirmation}>{showConfirmation?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>}
     {mode==='register'&&<label className="auth-consent"><input type="checkbox" required disabled={busy||authenticated}/><span>Acepto los <Link href="/terms">términos de uso</Link> y he leído la <Link href="/privacy">política de privacidad</Link>.</span></label>}
     <button className="auth-submit" type="submit" disabled={busy}>{busy?'Un momento…':authenticated?'Reintentar y continuar':mode==='register'?'Crear mi cuenta':mode==='reset'?'Enviar enlace de recuperación':mode==='password'?'Guardar nueva contraseña':'Entrar a mi workspace'}{!busy&&<ArrowRight size={17}/>}</button>
    </form>}
    {!success&&mode!=='check'&&<p className="auth-switch">{mode==='login'?<>¿Primera vez aquí? <Link href={route('/register')}>Crea tu cuenta</Link></>:<>¿Ya tienes cuenta? <Link href={route('/access')}>Inicia sesión</Link></>}</p>}
    <div className="auth-security"><LockKeyhole size={13}/><span>Tu cuenta es personal. Tu trabajo queda contigo.</span></div>
   </div><footer className="auth-panel-footer"><span>© {new Date().getFullYear()} Startupia</span><div><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link></div></footer>
  </section>
 </main>;
}
