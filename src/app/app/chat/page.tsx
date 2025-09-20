"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string };
type EmotionCandidate = { label: string; confidence?: number };

type Stage = "describe" | "select" | "chat" | "record";

export default function ChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [profile, setProfile] = useState<{ username: string | null; avatar_url: string | null; email?: string | null } | null>(null);
	const [userImgFailed, setUserImgFailed] = useState(false);
	const [botImgFailed, setBotImgFailed] = useState(false);
	const [stage, setStage] = useState<Stage>("describe");
	const [candidates, setCandidates] = useState<EmotionCandidate[]>([]);
	const [preEmotion, setPreEmotion] = useState<string | null>(null);
	const [preIntensity, setPreIntensity] = useState<number | null>(null);
	const [postEmotion, setPostEmotion] = useState<string | null>(null);
	const [postIntensity, setPostIntensity] = useState<number>(3);

	const searchParams = useSearchParams();
	const prefill = useMemo(() => searchParams.get("q") || "", [searchParams]);

	useEffect(() => {
		let mounted = true;
		fetch("/api/profiles", { method: "GET" })
			.then(async (r) => r.ok ? r.json() : null)
			.then((data) => { if (mounted && data) setProfile(data); })
			.catch(() => {});
		return () => { mounted = false; };
	}, []);

	useEffect(() => {
		if (prefill && stage === "describe" && messages.length === 0) {
			setInput(prefill);
		}
	}, [prefill, stage, messages.length]);

	async function sendMessage(e: React.FormEvent) {
		e.preventDefault();
		if (!input.trim()) return;

		if (stage === "describe") {
			const userText = input;
			const nextMessages: ChatMessage[] = [...messages, { role: "user" as const, content: userText }];
			setMessages(nextMessages);
			setInput("");
			setLoading(true);
			try {
				const [suggestRes, clsRes] = await Promise.all([
					fetch("/api/emotion/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: userText }) }),
					fetch("/api/emotion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: userText }) })
				]);
				const suggestJson = suggestRes.ok ? await suggestRes.json() : { candidates: [] };
				const clsJson = clsRes.ok ? await clsRes.json() : {};
				setCandidates((suggestJson?.candidates ?? []).map((c: any) => ({ label: String(c.label), confidence: Number(c.confidence ?? 0) })));
				if (clsJson?.intensity) setPreIntensity(Number(clsJson.intensity));
				if (clsJson?.emotion) setPreEmotion(String(clsJson.emotion));
				setStage("select");
			} finally {
				setLoading(false);
			}
			return;
		}

		if (stage === "chat") {
			const nextMessages: ChatMessage[] = [...messages, { role: "user" as const, content: input }];
			setMessages(nextMessages);
			setInput("");
			setLoading(true);
			try {
				const res = await fetch("/api/chat/stream", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ messages: nextMessages }),
				});
				const reader = res.body?.getReader();
				const decoder = new TextDecoder();
				let acc = "";
				if (reader) {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						const chunk = decoder.decode(value, { stream: true });
						acc += chunk;
						setMessages((prev) => {
							const copy = [...prev];
							const last = copy[copy.length - 1];
							if (last?.role === "assistant") {
								copy[copy.length - 1] = { role: "assistant", content: acc };
							} else {
								copy.push({ role: "assistant", content: acc });
							}
							return copy;
						});
					}
				}
			} catch (err) {
				setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
			} finally {
				setLoading(false);
			}
		}
	}

	function onSelectEmotion(label: string) {
		setPreEmotion(label);
		// Move to counseling stage and add a supportive assistant message
		setMessages((prev) => [...prev, { role: "assistant", content: "Thanks for sharing. Let's work through this together. What feels most helpful right now?" }]);
		setStage("chat");
	}

	async function saveRecord() {
		if (!preEmotion) return;
		const transcript = messages.map((m) => `${m.role === "user" ? "User" : "Breezie"}: ${m.content}`).join("\n");
		setLoading(true);
		try {
			await fetch("/api/emotion/sessions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					source: "chat",
					pre_emotion: preEmotion,
					pre_intensity: preIntensity,
					post_emotion: postEmotion ?? preEmotion,
					post_intensity: postIntensity,
					summary: undefined,
					content: transcript,
				}),
			});
			// reset
			setStage("describe");
			setMessages([]);
			setCandidates([]);
			setPreEmotion(null);
			setPreIntensity(null);
			setPostEmotion(null);
			setPostIntensity(3);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
			{/* Modern Header - text only */}
			<div className="mb-6 space-y-2">
				<h1 className="text-4xl font-bold tracking-tight gradient-text">Chat</h1>
				<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>I'm here to listen and support you</p>
			</div>

			<div className="flex h-full flex-col card-modern overflow-hidden">

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-8 space-y-6">
					{messages.length === 0 && (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<h3 className="mb-3 text-2xl font-semibold gradient-text">Start by describing what happened</h3>
							<p className="text-lg max-w-md leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
								Share what's on your mind. Then we’ll pick the emotion that best fits and continue.
							</p>
						</div>
					)}
				
					{messages.map((m, idx) => (
						<div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
							<div className={`flex max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
						{/* Avatar */}
						<div className="flex-shrink-0 w-10 h-10">
							{m.role === "user" ? (
								profile?.avatar_url && !userImgFailed ? (
									<img
										src={profile.avatar_url}
										alt="User avatar"
										className="w-10 h-10 rounded-full object-cover shadow-sm"
										onError={() => setUserImgFailed(true)}
									/>
								) : (
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-white"
										style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}
									>
										<span className="text-sm font-semibold">
											{(profile?.username || profile?.email || "U").toString().trim().charAt(0).toUpperCase()}
										</span>
									</div>
								)
							) : (
								!botImgFailed ? (
									<img
										src="/icon.png"
										alt="Breezie"
										className="w-10 h-10 rounded-full object-cover bg-white shadow-sm border border-gray-100"
										onError={() => setBotImgFailed(true)}
									/>
								) : (
									<div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 shadow-sm">
										<span className="text-sm font-semibold">B</span>
									</div>
								)
							)}
						</div>
								
								{/* Message bubble */}
								<div className={`rounded-2xl px-6 py-4 shadow-sm ${
									m.role === "user" 
										? "text-white" 
										: "bg-gray-50 text-gray-900"
								}`} style={m.role === "user" ? { background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" } : {}}>
									<p className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</p>
								</div>
							</div>
						</div>
					))}
				
				{loading && (
					<div className="flex justify-start">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0 w-8 h-8">
								{!botImgFailed ? (
									<img src="/icon.png" alt="Breezie" className="w-8 h-8 rounded-full object-cover bg-white shadow-sm border border-gray-100" onError={() => setBotImgFailed(true)} />
								) : (
									<div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 shadow-sm">
										<span className="text-xs font-semibold">B</span>
									</div>
								)}
							</div>
							<div className="bg-gray-100 rounded-2xl px-4 py-3">
								<div className="flex space-x-1">
									<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
									<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
									<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

				{/* Select emotions stage */}
				{stage === "select" && (
					<div className="border-t border-gray-100 p-6">
						<div className="mb-4">
							<p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Select the emotion that fits best</p>
						</div>
						<div className="flex flex-wrap gap-2 mb-5">
							{(candidates.length ? candidates : (preEmotion ? [{ label: preEmotion }] : [])).map((c, i) => (
								<button key={i} onClick={() => onSelectEmotion(c.label)} className={`px-3 py-2 rounded-full border text-sm transition ${preEmotion === c.label ? "border-blue-600 text-blue-700 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
									{c.label}{typeof c.confidence === "number" ? ` · ${(c.confidence * 100).toFixed(0)}%` : ""}
								</button>
							))}
						</div>
						<div className="flex items-center gap-4">
							<label className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Current intensity</label>
							<input type="range" min={1} max={5} value={preIntensity ?? 3} onChange={(e) => setPreIntensity(Number(e.target.value))} className="flex-1" />
							<button onClick={() => preEmotion && setStage("chat")} disabled={!preEmotion} className="btn-modern btn-primary px-4 py-2 disabled:opacity-50">Continue</button>
						</div>
					</div>
				)}

				{/* Input */}
				{stage !== "select" && (
					<div className="border-t border-gray-100 p-6">
						<form onSubmit={sendMessage} className="flex gap-4">
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={stage === "describe" ? "Share what's on your mind..." : "Type your message..."}
								className="flex-1 rounded-2xl border border-gray-200 px-6 py-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
								disabled={loading}
							/>
							<div className="flex gap-3">
								{stage === "chat" && (
									<button type="button" onClick={() => setStage("record")} className="rounded-xl border border-gray-200 px-4 py-2 text-sm">End session</button>
								)}
								<button 
									disabled={loading || !input.trim()} 
									className="btn-modern btn-primary flex-shrink-0 p-4 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
									</svg>
								</button>
							</div>
						</form>
					</div>
				)}
			</div>

			{/* Record modal/section */}
			{stage === "record" && (
				<div className="border-t border-gray-100 p-6">
					<div className="grid gap-4 md:grid-cols-3">
						<div className="md:col-span-1">
							<p className="text-sm font-medium">Record outcome</p>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>We’ll save the change from pre to post.</p>
						</div>
						<div className="md:col-span-2 grid gap-4">
							<div className="flex gap-3 items-center">
								<label className="w-24 text-sm" style={{ color: "var(--color-text-secondary)" }}>Pre emotion</label>
								<input value={preEmotion ?? ""} onChange={(e) => setPreEmotion(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2" />
							</div>
							<div className="flex gap-3 items-center">
								<label className="w-24 text-sm" style={{ color: "var(--color-text-secondary)" }}>Pre intensity</label>
								<input type="range" min={1} max={5} value={preIntensity ?? 3} onChange={(e) => setPreIntensity(Number(e.target.value))} className="flex-1" />
							</div>
							<div className="flex gap-3 items-center">
								<label className="w-24 text-sm" style={{ color: "var(--color-text-secondary)" }}>Post emotion</label>
								<input value={postEmotion ?? preEmotion ?? ""} onChange={(e) => setPostEmotion(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2" />
							</div>
							<div className="flex gap-3 items-center">
								<label className="w-24 text-sm" style={{ color: "var(--color-text-secondary)" }}>Post intensity</label>
								<input type="range" min={1} max={5} value={postIntensity} onChange={(e) => setPostIntensity(Number(e.target.value))} className="flex-1" />
							</div>
							<div className="flex gap-3">
								<button onClick={() => setStage("chat")} className="rounded-xl border border-gray-200 px-4 py-2 text-sm">Back</button>
								<button onClick={saveRecord} className="btn-modern btn-primary px-4 py-2">Save record</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}


