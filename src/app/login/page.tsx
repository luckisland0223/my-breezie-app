"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/env";

export default function LoginPage() {
	const supabase = createSupabaseBrowserClient();
	const [email, setEmail] = useState("");
	const [pending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			// @ts-expect-error global
			window.google?.accounts.id.initialize({
				client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
				callback: async (response: any) => {
					const credential = response?.credential;
					if (!credential) return;
					const { error } = await supabase.auth.signInWithIdToken({
						provider: "google",
						token: credential,
					});
					if (error) setMessage(error.message);
				}
			});
			// @ts-expect-error global
			window.google?.accounts.id.prompt();
		};
		document.head.appendChild(script);
	}, [supabase]);

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setMessage(null);
		startTransition(async () => {
			const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
			if (error) setMessage(error.message);
			else setMessage("Check your email for the magic link.");
		});
	}

	async function signInWithGoogle() {
		setMessage(null);
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${location.origin}/auth/callback` },
		});
		if (error) setMessage(error.message);
	}

	return (
		<main className="flex min-h-screen items-center justify-center px-6">
			<div className="w-full max-w-md space-y-6">
				<h1 className="text-2xl font-semibold">Sign in to Breezie</h1>
				<p className="text-sm text-gray-500">One Tap will appear automatically. If blocked, continue with email.</p>
				<form onSubmit={onSubmit} className="space-y-3">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						className="w-full rounded-md border px-3 py-2"
						inputMode="email"
						autoComplete="email"
						required
					/>
					<button disabled={pending} className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
						{pending ? "Sending..." : "Send magic link"}
					</button>
				</form>
				<div className="flex items-center gap-3">
					<div className="h-px flex-1 bg-gray-200" />
					<span className="text-xs text-gray-500">OR</span>
					<div className="h-px flex-1 bg-gray-200" />
				</div>
				<button onClick={signInWithGoogle} className="w-full rounded-md border px-3 py-2 hover:bg-gray-50">Continue with Google</button>
				{message && <p className="text-sm text-gray-600">{message}</p>}
			</div>
		</main>
	);
}


