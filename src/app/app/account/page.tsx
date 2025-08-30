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
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Apple-style Header */}
			<div className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>Account</h1>
				<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>Manage your Breezie account and subscription</p>
			</div>

			{/* Profile Card */}
			<div className="card-modern p-8 space-y-6">
				<div className="flex items-center space-x-4">
					<div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
						<span className="text-white text-2xl font-bold">{email.charAt(0).toUpperCase()}</span>
					</div>
					<div className="space-y-1">
						<h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>{email.split('@')[0]}</h2>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{email}</p>
						<div className="flex items-center space-x-2">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<span className="text-xs font-medium text-green-600">Active</span>
						</div>
					</div>
				</div>
			</div>

			{/* Subscription Card */}
			<div className="card-modern p-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Subscription</h3>
						<div className="space-y-1">
							<div className="flex items-center space-x-3">
								<span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Plan:</span>
								<span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
									{sub?.plan ?? "Free"}
								</span>
							</div>
							<div className="flex items-center space-x-3">
								<span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Status:</span>
								<span className={`px-3 py-1 text-sm font-medium rounded-full ${
									sub?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
								}`}>
									{sub?.status ?? "Inactive"}
								</span>
							</div>
						</div>
					</div>
					<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
						<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
					<form action={subscribe} className="flex-1">
						<button className="btn-modern btn-primary w-full px-6 py-3 text-base font-semibold">
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Upgrade to Pro
						</button>
					</form>
					<form action={manage} className="flex-1">
						<button className="w-full px-6 py-3 text-base font-semibold border border-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:border-gray-300" style={{ color: "var(--color-text-secondary)" }}>
							<svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Manage Subscription
						</button>
					</form>
				</div>
			</div>

			{/* Account Features */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="card-modern p-6 space-y-4">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
						<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Privacy Protected</h3>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Your emotional data is encrypted and secure</p>
					</div>
				</div>

				<div className="card-modern p-6 space-y-4">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
						<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<div>
						<h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>AI-Powered Insights</h3>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Get personalized emotional wellness recommendations</p>
					</div>
				</div>
			</div>
		</div>
	);
}


