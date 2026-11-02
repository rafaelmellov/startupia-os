import {PublicShell,Eyebrow,s} from '../../_public/public-shell';
import {CheckoutResult} from '../../_public/checkout-client';
export const metadata={title:'Estado de tu suscripción — Startupia',robots:{index:false,follow:true}};
export default function Success(){return <PublicShell><section className={s.result}><div className={s.hero}><Eyebrow>DE VUELTA EN STARTUPIA</Eyebrow><h1>Comprobemos<br/><em>tu siguiente paso.</em></h1><p className={s.lead}>Consulta el estado de tu suscripción antes de continuar.</p></div><CheckoutResult/></section></PublicShell>}
