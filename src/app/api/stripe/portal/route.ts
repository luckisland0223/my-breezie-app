import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
	if (!env.STRIPE_SECRET_KEY) {
		return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
	}
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
	// Ensure we have a Stripe customer id for this user
	let customerId: string | null = null;
	const { data: subRow } = await supabase
		.from("subscriptions")
		.select("stripe_customer_id")
		.eq("user_id", user.id)
		.maybeSingle();
	customerId = (subRow?.stripe_customer_id as string) ?? null;

	if (!customerId) {
		// Create a customer in Stripe and upsert into subscriptions for future use
		const customer = await stripe.customers.create({ email: user.email ?? undefined });
		customerId = customer.id;
		await supabase
			.from("subscriptions")
			.upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
	}

	const session = await stripe.billingPortal.sessions.create({
		customer: customerId!,
		return_url: env.STRIPE_BILLING_RETURN_URL ?? "http://localhost:3000/app/account",
	});
	return NextResponse.json({ url: session.url });
}


