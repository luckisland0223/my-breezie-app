import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { data } = await supabase.from("settings").select("share_with_model, reminders_enabled").eq("user_id", user.id).maybeSingle();
	return NextResponse.json({ share_with_model: data?.share_with_model ?? true, reminders_enabled: data?.reminders_enabled ?? false });
}

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const body = await req.json();
	const { share_with_model, reminders_enabled } = body ?? {};
	await supabase
		.from("settings")
		.upsert({ user_id: user.id, share_with_model: !!share_with_model, reminders_enabled: !!reminders_enabled }, { onConflict: "user_id" });
	return NextResponse.json({ ok: true });
}


