"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
	const [shareWithModel, setShareWithModel] = useState(true);
	const [remindersEnabled, setRemindersEnabled] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		(async () => {
			const res = await fetch("/api/settings");
			if (res.ok) {
				const json = await res.json();
				setShareWithModel(!!json.share_with_model);
				setRemindersEnabled(!!json.reminders_enabled);
			}
		})();
	}, []);

	async function save() {
		setSaving(true);
		await fetch("/api/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ share_with_model: shareWithModel, reminders_enabled: remindersEnabled }),
		});
		setSaving(false);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-4">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<label className="flex items-center gap-2">
				<input type="checkbox" checked={shareWithModel} onChange={(e) => setShareWithModel(e.target.checked)} />
				<span>Share past notes with model to improve support</span>
			</label>
			<label className="flex items-center gap-2">
				<input type="checkbox" checked={remindersEnabled} onChange={(e) => setRemindersEnabled(e.target.checked)} />
				<span>Enable daily mood reminder</span>
			</label>
			<button onClick={save} disabled={saving} className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
				{saving ? "Saving..." : "Save"}
			</button>
			<div className="pt-4">
				<a href="/api/export" className="text-sm text-gray-600 underline">Download my data (JSON)</a>
			</div>
		</div>
	);
}


