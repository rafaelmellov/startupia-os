"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
type Message={role:"user"|"assistant";content:string};
export default function Copilot(){
  const [prompt,setPrompt]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function send(e:FormEvent){
    e.preventDefault();const message=prompt.trim();if(!message||busy)return;
    setBusy(true);setError("");setPrompt("");
    setMessages(v=>[...v,{role:"user",content:message}]);
    try{
      const res=await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});
      const result=await res.json();
      if(!res.ok||!result.answer)throw new Error(result.error||"Error del proveedor");
      setMessages(v=>[...v,{role:"assistant",content:result.answer}]);
    }catch(e){setError(e instanceof Error?e.message:"No se pudo conectar")}
    finally{setBusy(false)}
  }
  return <section className="workspace-shell chat"><Link href="/os" className="small">← Volver</Link><h1>Copiloto.</h1><p className="muted">Asistencia empresarial, habilitada únicamente después de verificar el proveedor.</p>
    <div className="chat-messages" role="log" aria-live="polite">{messages.length===0?<p className="muted">Describe el problema que quieres resolver.</p>:messages.map((m,i)=><div key={i} className={"chat-bubble "+(m.role==="user"?"user":"")}>{m.content}</div>)}</div>
    <form onSubmit={send} className="chat-form"><textarea aria-label="Pregunta" required maxLength={6000} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Pregunta al copiloto..." /><button className="button" disabled={busy||!prompt.trim()}>{busy?"Consultando…":"Enviar"}</button></form>
    {error&&<p role="status" className="form-message">{error}</p>}
    <p className="note">El historial de este prototipo no se conserva y el envío de archivos no está habilitado; no se simulan respuestas.</p>
  </section>
}
