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
		<main className="relative min-h-screen bg-gradient-to-br" style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-30" style={{
				backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
			}} />
			
			<div className="relative flex min-h-screen items-center justify-center px-6 py-12">
				<div className="w-full max-w-md">
					{/* Card */}
					<div className="animate-fade-in-up rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
						{/* Header */}
						<div className="mb-8 text-center">
							<h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
							<p className="text-gray-600">Sign in to continue your journey</p>
						</div>

						{/* One Tap notice */}
						<div className="mb-6 rounded-lg bg-blue-50 p-3 text-center">
							<p className="text-sm text-blue-700">
								✨ One Tap will appear automatically. If blocked, use the options below.
							</p>
						</div>

						{/* Email form */}
						<form onSubmit={onSubmit} className="mb-6 space-y-4">
							<div>
								<label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
									Email address
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
									inputMode="email"
									autoComplete="email"
									required
								/>
							</div>
							<button 
								disabled={pending} 
								className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{pending ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Sending magic link...
									</span>
								) : (
									"Send magic link"
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="mb-6 flex items-center">
							<div className="flex-1 border-t border-gray-300" />
							<span className="mx-4 text-sm font-medium text-gray-500">OR</span>
							<div className="flex-1 border-t border-gray-300" />
						</div>

						{/* Google button */}
						<button 
							onClick={signInWithGoogle}
							className="group w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
						>
							<span className="flex items-center justify-center gap-3">
								<svg className="h-5 w-5" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
								</svg>
								Continue with Google
							</span>
						</button>

						{/* Message */}
						{message && (
							<div className={`mt-4 rounded-lg p-3 text-sm ${
								message.includes('Check your email') 
									? 'bg-green-50 text-green-700 border border-green-200' 
									: 'bg-red-50 text-red-700 border border-red-200'
							}`}>
								{message}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="mt-6 text-center">
						<p className="text-sm text-white/80">
							New to Breezie? Your account will be created automatically.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}


