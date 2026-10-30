"use client";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

type Answers = { startupName: string; problem: string; customer: string; objective: string };
const EMPTY: Answers = { startupName: "", problem: "", customer: "", objective: "" };
export default function Onboarding() {
  const [organization, setOrganization] = useState("");
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [status, setStatus] = useState("Cargando tu espacio…");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const client = createClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) { window.location.assign("/login"); return; }
        const { data: member, error } = await client.from("organization_members")
          .select("organization_id").eq("user_id", user.id).limit(1).maybeSingle();
        if (error || !member) throw new Error("No tienes una organización asignada.");
        const { data } = await client.from("onboardings").select("state")
          .eq("organization_id", member.organization_id).maybeSingle();
        if (!cancelled) {
          setOrganization(member.organization_id);
          if (data?.state) setAnswers({ ...EMPTY, ...(data.state as Partial<Answers>) });
          setStatus("");
        }
      } catch {
        if (!cancelled) setStatus("No se pudo abrir tu espacio. Comprueba tu suscripción y solicita acceso al administrador.");
      }
    }
    void load(); return () => { cancelled = true; };
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); if (!organization) return; setBusy(true);
    try {
      const client = createClient();
      const { error } = await client.from("onboardings").upsert({
        organization_id: organization, state: answers, completed_at: new Date().toISOString()
      }, { onConflict: "organization_id" });
      if (error) throw error;
      window.location.assign("/os");
    } catch { setStatus("No se guardaron los cambios. Revisa los permisos del espacio."); }
    finally { setBusy(false); }
  }
  return <section className="section wrap narrow">
    <span className="eyebrow">TU PUNTO DE PARTIDA</span>
    <h1>Construyamos sobre una base sólida.</h1>
    <p className="lead">Cuatro respuestas para entender tu proyecto. Puedes modificarlas después.</p>
    <form className="stack card" onSubmit={save}>
      <label>Nombre de tu startup<input required maxLength={100} value={answers.startupName} onChange={e=>setAnswers({...answers,startupName:e.target.value})} /></label>
      <label>¿Qué problema resuelve?<textarea required maxLength={700} value={answers.problem} onChange={e=>setAnswers({...answers,problem:e.target.value})} /></label>
      <label>¿Quién tiene ese problema?<textarea required maxLength={700} value={answers.customer} onChange={e=>setAnswers({...answers,customer:e.target.value})} /></label>
      <label>¿Cuál es tu objetivo más importante?<textarea required maxLength={700} value={answers.objective} onChange={e=>setAnswers({...answers,objective:e.target.value})} /></label>
      <button className="button" disabled={busy || !organization}>{busy ? "Guardando…" : "Guardar y continuar"}</button>
      {status && <p role="status" className="form-message">{status}</p>}
    </form>
  </section>;
}
