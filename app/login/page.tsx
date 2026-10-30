"use client";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const client = createClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.assign("/onboarding");
    } catch { setMessage("No se pudo iniciar sesión. Verifica tus datos y la configuración de acceso."); }
    finally { setBusy(false); }
  }
  async function magicLink() {
    setBusy(true); setMessage("");
    try {
      const client = createClient();
      const { error } = await client.auth.signInWithOtp({
        email, options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + "/auth/callback" }
      });
      if (error) throw error;
      setMessage("Si la cuenta existe, recibirás un enlace de acceso.");
    } catch { setMessage("No fue posible solicitar el enlace. Comprueba el correo."); }
    finally { setBusy(false); }
  }
  async function social(provider: "google" | "apple") {
    setBusy(true); setMessage("");
    try {
      const client = createClient();
      const { error } = await client.auth.signInWithOAuth({
        provider, options: { redirectTo: window.location.origin + "/auth/callback" }
      });
      if (error) throw error;
    } catch { setMessage("El proveedor no está disponible o no fue configurado."); setBusy(false); }
  }
  return <div className="auth-shell">
    <div className="auth-info"><span className="eyebrow">STARTUPIA OS</span><h1>Construye con criterio.</h1><p>Un único lugar para tu startup, tus datos y tus decisiones.</p></div>
    <form onSubmit={signIn} className="auth-card">
      <span className="small">BIENVENIDO DE NUEVO</span>
      <h2>Iniciar sesión</h2>
      <label htmlFor="email">Correo electrónico</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} />
      <label htmlFor="password">Contraseña</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="button" type="submit" disabled={busy}>{busy ? "Verificando…" : "Entrar a mi espacio"}</button>
      <button className="text-button" type="button" disabled={busy || !email} onClick={magicLink}>Enviarme un enlace de acceso</button>
      <div className="social">
        <button type="button" disabled={busy} onClick={()=>social("google")}>Continuar con Google</button>
        <button type="button" disabled={busy} onClick={()=>social("apple")}>Continuar con Apple</button>
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
      <p className="note">El registro de nuevos clientes se habilitará con el proceso de contratación validado.</p>
    </form>
  </div>;
}
