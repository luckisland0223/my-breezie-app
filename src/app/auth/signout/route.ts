import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	return NextResponse.redirect(new URL("/", req.url));
}


