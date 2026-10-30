import { NextResponse } from "next/server";
import { getEntitlement, getOrganizationContext } from "@/lib/auth";

export const runtime = "nodejs";
function json(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
async function context() {
  const ctx = await getOrganizationContext();
  if (ctx.error) return null;
  const plan = await getEntitlement(ctx.supabase, ctx.organizationId);
  if (!plan) return null;
  return ctx;
}
export async function GET() {
  try {
    const ctx = await context();
    if (!ctx) return json("No autorizado o sin suscripción activa.", 403);
    const { data, error } = await ctx.supabase.from("workspaces")
      .select("state,version,updated_at").eq("organization_id", ctx.organizationId).maybeSingle();
    if (error) return json("No se pudo consultar el workspace.", 500);
    return NextResponse.json({ state: data?.state ?? {}, version: data?.version ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch { return json("No se pudo consultar el workspace.", 500); }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return json("Origen inválido.", 403);
    const ctx = await context();
    if (!ctx || !["owner", "editor"].includes(ctx.role)) return json("No tienes permisos para editar.", 403);
    if (Number(request.headers.get("content-length") || "0") > 20_000) return json("Datos demasiado extensos.", 413);
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || !body.state || typeof body.state !== "object" || Array.isArray(body.state))
      return json("Estructura de datos inválida.", 400);
    const state = body.state as Record<string, unknown>;
    const allowed = ["startupName", "problem", "customer", "valueProposition", "nextMilestone"];
    if (Object.keys(state).some(k => !allowed.includes(k)) ||
        Object.values(state).some(v => typeof v !== "string" || v.length > 2000) ||
        JSON.stringify(state).length > 12_000) return json("Contenido del workspace inválido.", 400);
    const { error } = await ctx.supabase.from("workspaces")
      .upsert({ organization_id: ctx.organizationId, state, updated_at: new Date().toISOString() }, { onConflict: "organization_id" });
    if (error) return json("No se pudo guardar el workspace.", 500);
    return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return json("Solicitud inválida.", 400); }
}
