import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const redirectTo = "/app";

	if (code) {
		const supabase = await createSupabaseServerClient();
		const { data } = await supabase.auth.exchangeCodeForSession(code);
		// After OAuth (e.g., Google), if profile lacks username, try to set it from provider metadata
		try {
			const user = data?.user;
			const hasUsername = Boolean(user?.user_metadata?.username);
			const candidate = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.preferred_username || "").toString();
			if (user && !hasUsername && candidate) {
				await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: candidate }) }).catch(() => {});
			}
		} catch {}
	}

	return NextResponse.redirect(new URL(redirectTo, req.url));
}


