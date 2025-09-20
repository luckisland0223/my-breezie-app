import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const source = (body?.source ?? "").toString();
    if (source !== "chat" && source !== "diary") return NextResponse.json({ error: "Invalid source" }, { status: 400 });

    const payload = {
      user_id: user.id,
      source,
      pre_emotion: body?.pre_emotion ?? null,
      pre_intensity: body?.pre_intensity ?? null,
      post_emotion: body?.post_emotion ?? null,
      post_intensity: body?.post_intensity ?? null,
      summary: body?.summary ?? null,
      content: body?.content ?? null,
    } as any;

    const { data, error } = await supabase.from("emotion_sessions").insert(payload).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


