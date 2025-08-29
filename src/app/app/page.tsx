import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	const email = data.user?.email ?? "friend";
	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<h1 className="text-2xl font-semibold">Welcome back, {email}</h1>
			<p className="text-gray-600">How are you feeling right now?</p>
			<QuickCheckIn />
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
		<form action={QuickCheckInForm} className="space-y-3 rounded-md border p-4">
			<div>
				<label className="block text-sm text-gray-600">Mood (1-5)</label>
				<div className="mt-2 flex gap-2">
					<input name="mood" type="number" min={1} max={5} className="w-20 rounded-md border px-2 py-1" defaultValue={3} />
					<input name="energy" type="number" min={1} max={5} className="w-20 rounded-md border px-2 py-1" defaultValue={3} />
				</div>
			</div>
			<textarea name="note" placeholder="Optional note" className="w-full rounded-md border px-3 py-2" />
			<button className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">Save</button>
		</form>
	);
}


