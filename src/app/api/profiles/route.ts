import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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


