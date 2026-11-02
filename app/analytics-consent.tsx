'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {analyticsConsent,browserPrivacySignal,clearAnalyticsSession,CONSENT_KEY,trackAnalytics} from '../lib/analytics/client';
import styles from './analytics-consent.module.css';
export default function AnalyticsConsent(){
 const path=usePathname();const [ready,setReady]=useState(false);const [open,setOpen]=useState(false);const [accepted,setAccepted]=useState(false);const [blocked,setBlocked]=useState(false);
 useEffect(()=>{const sync=()=>{setBlocked(browserPrivacySignal());setAccepted(analyticsConsent());if(!analyticsConsent())clearAnalyticsSession();try{setOpen(!localStorage.getItem(CONSENT_KEY)&&!browserPrivacySignal())}catch{setOpen(false)}};sync();setReady(true);window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 useEffect(()=>{if(ready&&accepted)trackAnalytics('page_view',path)},[ready,accepted,path]);
 function choose(value:boolean){const enabled=value&&!browserPrivacySignal();try{localStorage.setItem(CONSENT_KEY,enabled?'accepted':'rejected')}catch{setAccepted(false);setOpen(false);return}if(!enabled)clearAnalyticsSession();setAccepted(enabled);setOpen(false)}
 if(!ready)return null;
 return <aside className={styles.preferences} aria-label="Preferencias de medición">{open?<div className={styles.panel}><strong>Medición opcional</strong><p>Con tu permiso, Startupia mide páginas y acciones generales durante tu sesión para mejorar la experiencia. No enviamos contenido del workspace, correos ni conversaciones. Puedes rechazar o retirar el permiso aquí. Consulta los detalles y proveedores en Privacidad.</p>{blocked&&<p>Tu navegador solicita no ser rastreado. La medición está desactivada.</p>}<div><button onClick={()=>choose(false)}>Rechazar</button><button disabled={blocked} onClick={()=>choose(true)}>Aceptar medición</button><button onClick={()=>setOpen(false)}>Cerrar</button></div><a href="/privacy">Privacidad</a></div>:<button className={styles.toggle} onClick={()=>setOpen(true)}>Medición: {accepted&&!blocked?'activada':'desactivada'}</button>}</aside>;
}
