'use client';
import {useState} from 'react';
export default function BillingControls({available,active}:{available:boolean;active:boolean}){
 const [busy,setBusy]=useState(''),[error,setError]=useState('');
 async function open(action:string,plan?:string){setBusy(action+plan);setError('');try{
  const response=await fetch('/api/billing/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(plan?{plan}:{})});const data=await response.json();
  if(!response.ok)throw Error(data.error||'No se pudo abrir facturación.');
  const url=new URL(data.url);if(url.protocol!=='https:'||!['checkout.stripe.com','billing.stripe.com'].includes(url.hostname))throw Error('Destino de facturación no válido.');
  location.assign(url.href);
 }catch(e){setError(e instanceof Error?e.message:'No se pudo abrir facturación.');setBusy('')}}
 return <section className="eco-card"><span className="eco-eyebrow">SUSCRIPCIONES</span><h2>Gestiona tu siguiente etapa.</h2><p>{available?'La contratación está habilitada en el entorno de pruebas de Stripe. Los pagos de prueba no activan un servicio de producción.':'La contratación está pendiente de configuración y verificación. Puedes guardar tu interés en los planes de tu cuenta.'}</p>{available&&(active?<button className="eco-button" disabled={!!busy} onClick={()=>open('portal')}>Gestionar suscripción en Stripe ↗</button>:<div className="eco-links"><button className="eco-button" disabled={!!busy} onClick={()=>open('checkout','build')}>Probar Build · USD 17/mes ↗</button><button className="eco-button secondary" disabled={!!busy} onClick={()=>open('checkout','growth')}>Probar Growth · USD 37/mes ↗</button></div>)}{busy&&<p role="status">Abriendo Stripe…</p>}{error&&<p role="alert" className="eco-feedback error">{error}</p>}</section>
}
