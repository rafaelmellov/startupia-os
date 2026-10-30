import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  try {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return NextResponse.redirect(new URL("/onboarding", origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
  }
}
