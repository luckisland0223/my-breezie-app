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
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Modern Header */}
			<div className="space-y-2">
				<h1 className="text-4xl font-bold tracking-tight gradient-text">⚙️ Settings</h1>
				<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>Customize your Breezie experience 🎨✨</p>
			</div>

			{/* Privacy & Data Settings */}
			<div className="card-modern p-8 space-y-6">
				<div className="flex items-center space-x-4 mb-6">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
						<span className="text-2xl">🔒</span>
					</div>
					<div>
						<h2 className="text-xl font-semibold gradient-text">🔒 Privacy & Data</h2>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Control how your data is used 🛡️</p>
					</div>
				</div>

				<div className="space-y-6">
					{/* AI Model Sharing Toggle */}
					<div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
						<div className="flex-1">
							<h3 className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>AI Model Training</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Share past notes with AI model to improve personalized support</p>
						</div>
						<label className="relative inline-flex items-center cursor-pointer ml-4">
							<input 
								type="checkbox" 
								checked={shareWithModel} 
								onChange={(e) => setShareWithModel(e.target.checked)}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>

					{/* Daily Reminders Toggle */}
					<div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
						<div className="flex-1">
							<h3 className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Daily Reminders</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Get gentle reminders to check in with your mood</p>
						</div>
						<label className="relative inline-flex items-center cursor-pointer ml-4">
							<input 
								type="checkbox" 
								checked={remindersEnabled} 
								onChange={(e) => setRemindersEnabled(e.target.checked)}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
				</div>

				{/* Save Button */}
				<div className="pt-4 border-t border-gray-100">
					<button 
						onClick={save} 
						disabled={saving}
						className="btn-modern btn-primary px-8 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving ? (
							<>
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Saving...
							</>
						) : (
							<>
								<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Save Changes
							</>
						)}
					</button>
				</div>
			</div>

			{/* Data Export */}
			<div className="card-modern p-8 space-y-6">
				<div className="flex items-center space-x-4 mb-6">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
						<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>Data Export</h2>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Download your personal data</p>
					</div>
				</div>

				<div className="p-4 bg-gray-50/50 rounded-xl">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Export All Data</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Download all your mood entries, chat history, and settings as JSON</p>
						</div>
						<a 
							href="/api/export" 
							className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
							style={{ color: "var(--color-text-secondary)" }}
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Download
						</a>
					</div>
				</div>
			</div>

			{/* Additional Settings */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="card-modern p-6 space-y-4">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
						<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
						</svg>
					</div>
					<div>
						<h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Appearance</h3>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Customize themes and display preferences</p>
						<button className="text-sm text-blue-600 font-medium mt-2">Coming Soon</button>
					</div>
				</div>

				<div className="card-modern p-6 space-y-4">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
						<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
						</svg>
					</div>
					<div>
						<h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>Integrations</h3>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Connect with health apps and services</p>
						<button className="text-sm text-blue-600 font-medium mt-2">Coming Soon</button>
					</div>
				</div>
			</div>
		</div>
	);
}


