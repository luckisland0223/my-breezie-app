import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
	if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
		return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
	}
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
		success_url: env.STRIPE_BILLING_RETURN_URL ?? "http://localhost:3000/app/account",
		cancel_url: env.STRIPE_BILLING_RETURN_URL ?? "http://localhost:3000/app/account",
		metadata: { user_id: user.id },
	});
	return NextResponse.json({ url: session.url });
}


