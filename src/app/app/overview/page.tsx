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
		<div className="mx-auto max-w-4xl space-y-6">
			<h1 className="text-2xl font-semibold">Overview</h1>
			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-md border p-4">
					<div className="text-sm text-gray-500">Average Mood</div>
					<div className="text-3xl font-semibold">{avgMood}</div>
				</div>
				<div className="rounded-md border p-4">
					<div className="text-sm text-gray-500">Average Energy</div>
					<div className="text-3xl font-semibold">{avgEnergy}</div>
				</div>
			</div>
			<div className="rounded-md border p-4">
				<div className="mb-2 text-sm text-gray-500">Recent Check-ins</div>
				<ul className="space-y-1">
					{moods.slice(0, 10).map((m: Mood, i: number) => (
						<li key={i} className="text-sm text-gray-700">
							{new Date(m.created_at).toLocaleString()} — mood {m.mood}, energy {m.energy}
						</li>
					))}
					{moods.length === 0 && <li className="text-sm text-gray-500">No data yet.</li>}
				</ul>
			</div>
		</div>
	);
}


