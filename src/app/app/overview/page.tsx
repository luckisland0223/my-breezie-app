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
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Overview</h1>
				<p className="mt-2 text-gray-600">Track your emotional journey and discover patterns</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white rounded-xl shadow-sm border p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Average Mood</p>
							<p className="text-3xl font-bold text-gray-900">{avgMood}</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M7 16h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-green-600 font-medium">+2.1%</span>
							<span className="text-gray-500 ml-2">from last week</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Average Energy</p>
							<p className="text-3xl font-bold text-gray-900">{avgEnergy}</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-green-600 font-medium">+5.4%</span>
							<span className="text-gray-500 ml-2">from last week</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Check-ins</p>
							<p className="text-3xl font-bold text-gray-900">{moods.length}</p>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex items-center text-sm">
							<span className="text-blue-600 font-medium">This month</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Streak</p>
							<p className="text-3xl font-bold text-gray-900">7</p>
						</div>
						<div className="p-3 bg-orange-100 rounded-full">
							<svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
							</svg>
						</div>
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
				<div className="bg-white rounded-xl shadow-sm border">
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
									<div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
										<div className="flex items-center space-x-3">
											<div className="flex-shrink-0">
												<div className={`w-3 h-3 rounded-full ${
													m.mood >= 4 ? 'bg-green-400' : 
													m.mood >= 3 ? 'bg-yellow-400' : 'bg-red-400'
												}`} />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">
													Mood: {m.mood}/5, Energy: {m.energy}/5
												</p>
												<p className="text-xs text-gray-500">
													{new Date(m.created_at).toLocaleDateString()} at {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
												</p>
											</div>
										</div>
									</div>
								))}
								{moods.length > 5 && (
									<div className="text-center pt-4">
										<button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
											View all check-ins
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Mood Trends */}
				<div className="bg-white rounded-xl shadow-sm border">
					<div className="p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Mood Trends</h3>
						<p className="text-sm text-gray-600">How you've been feeling lately</p>
					</div>
					<div className="p-6">
						{moods.length === 0 ? (
							<div className="text-center py-8">
								<div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
									</svg>
								</div>
								<h4 className="text-sm font-medium text-gray-900 mb-1">No trends yet</h4>
								<p className="text-sm text-gray-500">Check in regularly to see your mood patterns</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">This week's average</span>
									<span className="text-lg font-semibold text-gray-900">{avgMood}/5</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div 
										className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
										style={{ width: `${(parseFloat(avgMood) / 5) * 100}%` }}
									/>
								</div>
								<div className="grid grid-cols-3 gap-4 pt-4">
									<div className="text-center">
										<div className="text-2xl font-bold text-green-600">
											{moods.filter(m => m.mood >= 4).length}
										</div>
										<div className="text-xs text-gray-500">Good days</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-yellow-600">
											{moods.filter(m => m.mood === 3).length}
										</div>
										<div className="text-xs text-gray-500">Okay days</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-red-600">
											{moods.filter(m => m.mood <= 2).length}
										</div>
										<div className="text-xs text-gray-500">Tough days</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}


