import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
	if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
	}
	const rawBody = await req.text();
	const sig = (req.headers.get("stripe-signature") ?? "").toString();
	let event: Stripe.Event;
	try {
		const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
		event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
	}

	const supabase = await createSupabaseServerClient();
	// Expect metadata.user_id set in checkout session
	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			const userId = (session.metadata?.user_id as string) ?? null;
			if (userId) {
				await supabase
					.from("subscriptions")
					.upsert({
						user_id: userId,
						stripe_customer_id: session.customer as string,
						stripe_subscription_id: session.subscription as string,
						plan: session.mode === "subscription" ? "pro" : null,
						status: "active",
					} as any, { onConflict: "user_id" });
			}
			break;
		}
		case "customer.subscription.deleted":
		case "customer.subscription.updated": {
			const sub = event.data.object as Stripe.Subscription;
			const userId = (sub.metadata?.user_id as string) ?? null;
			if (userId) {
				await supabase
					.from("subscriptions")
					.upsert({
						user_id: userId,
						stripe_customer_id: sub.customer as string,
						stripe_subscription_id: sub.id,
						plan: sub.items.data[0]?.price?.id ?? null,
						status: sub.status,
						current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
					} as any, { onConflict: "user_id" });
			}
			break;
		}
		default:
			break;
	}

	return NextResponse.json({ received: true });
}

export const config = {
	api: {
		bodyParser: false,
	},
};


