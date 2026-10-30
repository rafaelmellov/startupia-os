import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
type Mentor={id:string;name:string;role:string;bio:string;specialty:string};
export default async function Mentors(){
  let mentors:Mentor[]=[];let unavailable=false;
  try{
    const client=await createClient();
    const {data,error}=await client.from("mentors").select("id,name,role,bio,specialty").eq("active",true).limit(30);
    if(error)unavailable=true;else mentors=(data??[]) as Mentor[];
  }catch{unavailable=true}
  return <section className="section wrap"><span className="eyebrow">STARTUPIA MENTORS</span><h1>Experiencia para mejores decisiones.</h1><p className="lead">Acompañamiento en estrategia, producto y crecimiento.</p>
  {unavailable?<p role="status">No se pudo consultar el catálogo.</p>:mentors.length?<div className="tiles">{mentors.map(m=><article key={m.id} className="tile"><span className="small">{m.specialty}</span><h3>{m.name}</h3><p>{m.role}</p><p>{m.bio}</p></article>)}</div>:<div className="card"><h3>Catálogo en preparación</h3><p>Cuando se incorporen mentores aprobados, aparecerán aquí. No se simulan agendas ni reservas.</p></div>}
  <div className="actions"><Link href="/" className="button button-ghost">Volver a Startupia</Link></div></section>
}
