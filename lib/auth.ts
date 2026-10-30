import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getOrganizationContext() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) return { error: "unauthorized" as const, supabase };
  const user = userData.user;
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id,role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membershipError) return { error: "membership_error" as const, supabase };
  if (!membership) return { error: "no_organization" as const, supabase };
  return { supabase, user, organizationId: membership.organization_id as string, role: membership.role as string };
}

export async function getEntitlement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
) {
  const { data, error } = await supabase.from("subscriptions")
    .select("plan,status,valid_until")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error || !data) return null;
  const valid = data.status === "active" || data.status === "trialing";
  const notExpired = Date.parse(data.valid_until) > Date.now();
  if (!valid || !notExpired) return null;
  return data.plan as "build" | "growth";
}
