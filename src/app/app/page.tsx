import { useEffect } from "react";
import { useRouter } from "next/router";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AppHomePage() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	const email = data.user?.email ?? "friend";

	const router = useRouter();

	useEffect(() => {
		if (data.user) {
			router.push("/app");
		}
	}, [data.user, router]);

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Welcome Header - Modern style */}
			<div className="text-center animate-bounce-in">
				<div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg animate-wiggle" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
					<span className="text-3xl">👋</span>
				</div>
				<h1 className="text-4xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
					Welcome to Breezie.io!
				</h1>
				<p className="text-xl mb-6" style={{ color: "var(--color-text-secondary)" }}>Your journey to emotional well-being starts here.</p>
				
				{/* Get Started Button */}
				<div className="mt-8">
					<Link
						className="btn-modern btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-bold shadow-lg hover:animate-wiggle"
						href="/login"
					>
						<span className="text-xl">🚀</span>
						Get Started
					</Link>
				</div>
			</div>

			{/* Quick Check-in Card - Modern style */}
			<div className="card-modern p-8 animate-bounce-in animation-delay-200">
				<div className="text-center mb-8">
					<div className="inline-flex p-4 rounded-full mb-6 shadow-lg animate-pulse-success" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
						<span className="text-4xl">❤️</span>
					</div>
					<h2 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Daily Check-in</h2>
					<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>Take a moment to reflect on your current state</p>
				</div>
				<QuickCheckIn />
			</div>

			{/* Quick Actions - Modern style */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-bounce-in animation-delay-400">
				<a href="/app/chat" className="card-modern p-6 group">
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="p-4 rounded-full shadow-lg group-hover:animate-wiggle" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
							<span className="text-3xl">💬</span>
						</div>
						<div>
							<h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Start Chatting</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Talk through your feelings with AI support</p>
						</div>
					</div>
				</a>

				<a href="/app/overview" className="card-modern p-6 group">
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="p-4 rounded-full shadow-lg group-hover:animate-wiggle" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
							<span className="text-3xl">📊</span>
						</div>
						<div>
							<h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>View Insights</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>See your emotional progress and trends</p>
						</div>
					</div>
				</a>

				<a href="/app/analysis" className="card-modern p-6 group">
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="p-4 rounded-full shadow-lg group-hover:animate-wiggle" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
							<span className="text-3xl">✨</span>
						</div>
						<div>
							<h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Get Analysis</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Discover patterns and insights</p>
						</div>
					</div>
				</a>
			</div>
		</div>
	);
}

function MoodButton({ value, onClick }: { value: number; onClick: (v: number) => void }) {
	return (
		<button onClick={() => onClick(value)} className="rounded-md border px-3 py-2 hover:bg-gray-50">
			{value}
		</button>
	);
}

async function QuickCheckInForm(formData: FormData) {
	"use server";
	const mood = Number(formData.get("mood"));
	const energy = Number(formData.get("energy"));
	const note = String(formData.get("note") ?? "");
	await fetch("/api/moods", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ mood, energy, note }),
	});
}

function QuickCheckIn() {
	return (
		<form action={QuickCheckInForm} className="space-y-6">
			{/* Mood Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">How's your mood? (1-5)</label>
				<div className="flex justify-between gap-2">
					{[1, 2, 3, 4, 5].map((value) => (
						<label key={value} className="flex flex-col items-center cursor-pointer group">
							<input 
								type="radio" 
								name="mood" 
								value={value} 
								defaultChecked={value === 3}
								className="sr-only peer"
							/>
							<div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-semibold transition-all peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white group-hover:border-blue-400">
								{value}
							</div>
							<span className="text-xs text-gray-500 mt-1">
								{value === 1 ? 'Low' : value === 2 ? 'Poor' : value === 3 ? 'Okay' : value === 4 ? 'Good' : 'Great'}
							</span>
						</label>
					))}
				</div>
			</div>

			{/* Energy Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">Energy level? (1-5)</label>
				<div className="flex justify-between gap-2">
					{[1, 2, 3, 4, 5].map((value) => (
						<label key={value} className="flex flex-col items-center cursor-pointer group">
							<input 
								type="radio" 
								name="energy" 
								value={value} 
								defaultChecked={value === 3}
								className="sr-only peer"
							/>
							<div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-semibold transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500 peer-checked:text-white group-hover:border-purple-400">
								{value}
							</div>
							<span className="text-xs text-gray-500 mt-1">
								{value === 1 ? 'Drained' : value === 2 ? 'Low' : value === 3 ? 'Okay' : value === 4 ? 'Good' : 'High'}
							</span>
						</label>
					))}
				</div>
			</div>

			{/* Optional Note */}
			<div>
				<label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
					What's on your mind? (optional)
				</label>
				<textarea 
					id="note"
					name="note" 
					placeholder="Share any thoughts, feelings, or what happened today..."
					className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
					rows={3}
				/>
			</div>

			{/* Submit Button - Modern style */}
			<button 
				type="submit"
				className="btn-modern btn-primary w-full px-6 py-4 text-lg"
			>
				<span className="text-xl mr-2">✅</span>
				Save Check-in
			</button>
		</form>
	);
}


