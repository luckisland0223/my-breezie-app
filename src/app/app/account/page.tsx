import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AccountPage() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	const email = data.user?.email ?? "";
	const { data: sub } = await supabase.from("subscriptions").select("status, plan").eq("user_id", data.user?.id ?? "").maybeSingle();

	async function subscribe() {
		"use server";
		const res = await fetch("/api/stripe/checkout", { method: "POST" });
		const json = await res.json();
		if (json?.url) redirect(json.url);
	}

	async function manage() {
		"use server";
		const res = await fetch("/api/stripe/portal", { method: "POST" });
		const json = await res.json();
		if (json?.url) redirect(json.url);
	}
	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<h1 className="text-2xl font-semibold">Account</h1>
			<p className="text-gray-600">Signed in as {email}</p>
			<p className="text-sm text-gray-500">Plan: {sub?.plan ?? "free"} · Status: {sub?.status ?? "inactive"}</p>
			<form action={subscribe}>
				<button className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">Subscribe</button>
			</form>
			<form action={manage}>
				<button className="rounded-md border px-4 py-2 hover:bg-gray-50">Manage subscription</button>
			</form>
		</div>
	);
}


