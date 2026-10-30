"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Workspace = { startupName: string; problem: string; customer: string; valueProposition: string; nextMilestone: string };
const blank: Workspace = { startupName: "", problem: "", customer: "", valueProposition: "", nextMilestone: "" };
const fields: Array<[keyof Workspace, string]> = [
  ["startupName","Nombre del proyecto"],["problem","Problema prioritario"],
  ["customer","Cliente inicial"],["valueProposition","Propuesta de valor"],["nextMilestone","Próximo objetivo"]
];
export default function WorkspacePage() {
  const [data, setData] = useState<Workspace>(blank);
  const [status, setStatus] = useState("Consultando workspace…");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void fetch("/api/workspace", { cache: "no-store" }).then(async r => {
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setData({ ...blank, ...result.state }); setStatus("");
    }).catch(() => setStatus("No se pudo cargar. Verifica tu acceso y tu suscripción."));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const res = await fetch("/api/workspace", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: data })
      });
      if (!res.ok) throw new Error("Error");
      setStatus("Guardado correctamente en tu organización.");
    } catch { setStatus("No se pudo guardar. Comprueba tu conexión y tus permisos."); }
    finally { setBusy(false); }
  }
  return <section className="workspace-shell narrow">
    <Link href="/os" className="small">← Volver al panel</Link><h1>Workspace.</h1>
    <p className="lead">Estas respuestas permanecen asociadas a tu organización y pueden alimentar el contexto del copiloto.</p>
    <form className="card stack" onSubmit={save}>
      {fields.map(([key,label]) => <label key={key}>{label}<textarea value={data[key]} onChange={e => setData({ ...data,[key]:e.target.value })} maxLength={2000} /></label>)}
      <button disabled={busy} type="submit" className="button">{busy ? "Guardando…" : "Guardar workspace"}</button>
      {status && <p role="status" className="form-message">{status}</p>}
    </form>
  </section>;
}
