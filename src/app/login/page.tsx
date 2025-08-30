"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
	const supabase = createSupabaseBrowserClient();
	const [tab, setTab] = useState<"signin" | "signup">("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [pending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);

	function resetMessages() {
		setMessage(null);
	}

	function onSignIn(e: React.FormEvent) {
		e.preventDefault();
		resetMessages();
		startTransition(async () => {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) setMessage(error.message);
			else window.location.href = "/app";
		});
	}

	function onSignUp(e: React.FormEvent) {
		e.preventDefault();
		resetMessages();
		startTransition(async () => {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { username } },
			});
			if (error) setMessage(error.message);
			else setMessage("Account created. Please check your email to confirm.");
		});
	}

	async function signInWithGoogle() {
		resetMessages();
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
							<h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome</h1>
							<p className="text-gray-600">Sign in or create an account</p>
						</div>

						{/* Tabs */}
						<div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
							<button
								onClick={() => setTab("signin")}
								className={`rounded-lg py-2 text-sm font-semibold transition ${tab === "signin" ? "bg-white shadow" : "text-gray-600"}`}
							>
								Sign In
							</button>
							<button
								onClick={() => setTab("signup")}
								className={`rounded-lg py-2 text-sm font-semibold transition ${tab === "signup" ? "bg-white shadow" : "text-gray-600"}`}
							>
								Register
							</button>
						</div>

						{tab === "signin" ? (
							<form onSubmit={onSignIn} className="mb-6 space-y-4">
								<div>
									<label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
									<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
								</div>
								<div>
									<label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
									<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
								</div>
								<button disabled={pending} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
									{pending ? "Signing in..." : "Sign In"}
								</button>
							</form>
						) : (
							<form onSubmit={onSignUp} className="mb-6 space-y-4">
								<div>
									<label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">Username</label>
									<input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your display name" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
								</div>
								<div>
									<label htmlFor="email-r" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
									<input id="email-r" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
								</div>
								<div>
									<label htmlFor="password-r" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
									<input id="password-r" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" required />
								</div>
								<button disabled={pending} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
									{pending ? "Creating account..." : "Create account"}
								</button>
							</form>
						)}

						{/* Divider */}
						<div className="mb-6 flex items-center">
							<div className="flex-1 border-t border-gray-300" />
							<span className="mx-4 text-sm font-medium text-gray-500">OR</span>
							<div className="flex-1 border-t border-gray-300" />
						</div>

						{/* Google button */}
						<button onClick={signInWithGoogle} className="group w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md">
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
								message.includes("created")
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}>
								{message}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="mt-6 text-center">
						<p className="text-sm text-white/80">
							By signing up, your account will be created automatically.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}


