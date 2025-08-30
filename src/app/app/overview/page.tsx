"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OverviewPage() {
	type Mood = { mood: number; energy: number; created_at: string };
	const { data } = useSWR<{ moods: Mood[] }>("/api/moods", fetcher, {
		refreshInterval: 30_000,
	});
	const moods: Mood[] = data?.moods ?? [];
	const avgMood = moods.length ? (moods.reduce((sum: number, item: Mood) => sum + item.mood, 0) / moods.length).toFixed(2) : "-";
	const avgEnergy = moods.length ? (moods.reduce((sum: number, item: Mood) => sum + item.energy, 0) / moods.length).toFixed(2) : "-";

	return (
		<div className="max-w-6xl mx-auto space-y-8">
			{/* Modern Header */}
			<div className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight gradient-text">Overview</h1>
				<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>Track your emotional journey and discover patterns</p>
			</div>

			{/* Apple-style Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="card-modern p-8">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Average Mood</p>
							<p className="text-3xl font-bold text-gray-900">{avgMood}</p>
						</div>
						<div className="p-3 rounded-2xl shadow-lg bg-gray-100" />
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-green-600 font-medium">+2.1%</span>
							<span className="text-gray-500 ml-2">from last week</span>
						</div>
					</div>
				</div>

				<div className="card-modern p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Average Energy</p>
							<p className="text-3xl font-bold text-gray-900">{avgEnergy}</p>
						</div>
						<div className="p-3 rounded-2xl shadow-lg bg-gray-100" />
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-green-600 font-medium">+5.4%</span>
							<span className="text-gray-500 ml-2">from last week</span>
						</div>
					</div>
				</div>

				<div className="card-modern p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Check-ins</p>
							<p className="text-3xl font-bold text-gray-900">{moods.length}</p>
						</div>
						<div className="p-3 rounded-2xl shadow-lg bg-gray-100" />
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-blue-600 font-medium">This month</span>
						</div>
					</div>
				</div>

				<div className="card-modern p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Streak</p>
							<p className="text-3xl font-bold text-gray-900">7</p>
						</div>
						<div className="p-3 rounded-2xl shadow-lg bg-gray-100" />
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-orange-600 font-medium">Days in a row</span>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Check-ins */}
				<div className="card-modern">
					<div className="p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Recent Check-ins</h3>
						<p className="text-sm text-gray-600">Your latest mood entries</p>
					</div>
					<div className="p-6">
						{moods.length === 0 ? (
							<div className="text-center py-8">
								<div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
								<h4 className="text-sm font-medium text-gray-900 mb-1">No check-ins yet</h4>
								<p className="text-sm text-gray-500">Start tracking your mood to see insights here</p>
							</div>
						) : (
							<div className="space-y-4">
								{moods.slice(0, 5).map((m: Mood, i: number) => (
									<div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
										<div>
											<p className="text-sm font-medium text-gray-900">{new Date(m.created_at).toLocaleString()}</p>
											<p className="text-xs text-gray-600">Mood: {m.mood} • Energy: {m.energy}</p>
										</div>
										<div className="text-sm text-gray-500">Logged</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Suggestions */}
				<div className="card-modern">
					<div className="p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Suggestions</h3>
						<p className="text-sm text-gray-600">Ways to improve your emotional wellness</p>
					</div>
					<div className="p-6 space-y-4">
						<div className="p-4 bg-gray-50 rounded-xl">
							<h4 className="text-sm font-medium text-gray-900">Take a short walk</h4>
							<p className="text-sm text-gray-600">A quick 10-minute walk can help clear your mind</p>
						</div>
						<div className="p-4 bg-gray-50 rounded-xl">
							<h4 className="text-sm font-medium text-gray-900">Write down your thoughts</h4>
							<p className="text-sm text-gray-600">Journaling helps you process emotions</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


