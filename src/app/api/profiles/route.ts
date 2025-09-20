import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase.from("profiles").select("username, avatar_url").eq("user_id", user.id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const username = data?.username || (user.user_metadata?.username as string | undefined) || null;
    const avatar_url = data?.avatar_url || (user.user_metadata?.avatar_url as string | undefined) || null;
    return NextResponse.json({ username, avatar_url, email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const username = (body?.username ?? "").toString().trim();
    const avatar_url = (body?.avatar_url ?? "").toString().trim() || null;
    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    // Upsert profile
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, username, avatar_url }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


