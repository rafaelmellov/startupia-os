import Link from "next/link";
import { redirect } from "next/navigation";
import { getEntitlement, getOrganizationContext } from "@/lib/auth";

export default async function OS() {
  const ctx = await getOrganizationContext();
  if (ctx.error === "unauthorized") redirect("/login");
  if (ctx.error) return <section className="workspace-shell"><h1>Tu espacio aún no está disponible.</h1><p className="lead">No se encontró una organización asignada. Necesitas una cuenta habilitada para acceder.</p></section>;
  const plan = await getEntitlement(ctx.supabase, ctx.organizationId);
  if (!plan) return <section className="workspace-shell"><span className="eyebrow">ACCESO PENDIENTE</span><h1>Tu suscripción no está activa.</h1><p className="lead">Para proteger tu cuenta, no concedemos funciones de pago sin una suscripción verificada. No se realizan cargos desde esta página.</p></section>;
  const { data: org } = await ctx.supabase.from("organizations").select("name").eq("id", ctx.organizationId).maybeSingle();
  return <section className="workspace-shell">
    <span className="eyebrow">STARTUPIA OS · {plan.toUpperCase()}</span>
    <h1>Tu startup, organizada.</h1>
    <p className="lead">{org?.name || "Tu organización"} · Un espacio común para planificación, seguimiento e inteligencia artificial.</p>
    <nav className="workspace-nav"><Link href="/os">Resumen</Link><Link href="/os/workspace">Workspace</Link><Link href="/os/copiloto">Copiloto</Link><Link href="/mentors">Mentors</Link></nav>
    <div className="workspace-grid">
      <Link className="tile" href="/os/workspace"><span className="small">01 · ORGANIZACIÓN</span><h3>Workspace</h3><p>Guarda y recupera el contexto estratégico de tu proyecto.</p></Link>
      <Link className="tile" href="/os/copiloto"><span className="small">02 · INTELIGENCIA</span><h3>Copiloto</h3><p>Consulta un modelo remoto mediante un endpoint protegido, cuando esté habilitado.</p></Link>
      <Link className="tile" href="/mentors"><span className="small">03 · EXPERIENCIA</span><h3>Mentors</h3><p>Explora los mentores disponibles, sin citas ficticias.</p></Link>
    </div>
  </section>;
}
