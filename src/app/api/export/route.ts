import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const [moods, convs, msgs] = await Promise.all([
		supabase.from("mood_logs").select("*").order("created_at", { ascending: false }),
		supabase.from("conversations").select("*").order("created_at", { ascending: false }).throwOnError(),
		supabase.from("messages").select("*").order("created_at", { ascending: false }).throwOnError(),
	]);
	const payload = {
		mood_logs: moods.data ?? [],
		conversations: convs.data ?? [],
		messages: msgs.data ?? [],
	};
	return new NextResponse(JSON.stringify(payload, null, 2), {
		headers: {
			"Content-Type": "application/json",
			"Content-Disposition": "attachment; filename=export.json",
		},
	});
}


