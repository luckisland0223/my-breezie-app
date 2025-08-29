import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { data, error } = await supabase
		.from("mood_logs")
		.select("id, mood, energy, tags, note, created_at")
		.order("created_at", { ascending: false })
		.limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ moods: data });
}

export async function POST(req: Request) {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const body = await req.json().catch(() => ({}));
	const { mood, energy, tags = [], note = "" } = body ?? {};
	if (!Number.isInteger(mood) || mood < 1 || mood > 5) return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
	if (!Number.isInteger(energy) || energy < 1 || energy > 5) return NextResponse.json({ error: "Invalid energy" }, { status: 400 });
	const { data, error } = await supabase
		.from("mood_logs")
		.insert({ user_id: user.id, mood, energy, tags, note })
		.select("id, mood, energy, tags, note, created_at")
		.single();
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ mood: data });
}


