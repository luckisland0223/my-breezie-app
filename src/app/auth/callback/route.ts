import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const redirectTo = "/app";

	if (code) {
		const supabase = await createSupabaseServerClient();
		await supabase.auth.exchangeCodeForSession(code);
	}

	return NextResponse.redirect(new URL(redirectTo, req.url));
}


