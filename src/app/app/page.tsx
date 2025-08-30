import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	const email = data.user?.email ?? "friend";
	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Welcome Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Welcome back, {email.split('@')[0]}
				</h1>
				<p className="text-gray-600 text-lg">How are you feeling right now?</p>
			</div>

			{/* Quick Check-in Card */}
			<div className="bg-white rounded-xl shadow-sm border p-8">
				<div className="text-center mb-6">
					<div className="inline-flex p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
						<svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Daily Check-in</h2>
					<p className="text-gray-600">Take a moment to reflect on your current state</p>
				</div>
				<QuickCheckIn />
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<a href="/app/chat" className="group bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
							<svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900">Start Chatting</h3>
							<p className="text-sm text-gray-600">Talk through your feelings</p>
						</div>
					</div>
				</a>

				<a href="/app/overview" className="group bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
							<svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900">View Insights</h3>
							<p className="text-sm text-gray-600">See your progress</p>
						</div>
					</div>
				</a>

				<a href="/app/analysis" className="group bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center space-x-4">
						<div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
							<svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900">Get Analysis</h3>
							<p className="text-sm text-gray-600">Discover patterns</p>
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

			{/* Submit Button */}
			<button 
				type="submit"
				className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
			>
				Save Check-in
			</button>
		</form>
	);
}


