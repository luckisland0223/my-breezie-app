"use client";

import { useEffect, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [profile, setProfile] = useState<{ username: string | null; avatar_url: string | null; email?: string | null } | null>(null);
	const [userImgFailed, setUserImgFailed] = useState(false);
	const [botImgFailed, setBotImgFailed] = useState(false);

	useEffect(() => {
		let mounted = true;
		fetch("/api/profiles", { method: "GET" })
			.then(async (r) => r.ok ? r.json() : null)
			.then((data) => { if (mounted && data) setProfile(data); })
			.catch(() => {});
		return () => { mounted = false; };
	}, []);

	async function sendMessage(e: React.FormEvent) {
		e.preventDefault();
		if (!input.trim()) return;
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
			// best-effort emotion tagging
			fetch("/api/emotion", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: input }),
			}).catch(() => {});
		} catch (err) {
			setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
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
							<h3 className="mb-3 text-2xl font-semibold gradient-text">Start a conversation</h3>
							<p className="text-lg max-w-md leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
								Say anything that's on your mind. I'm here to listen and support you through whatever you're feeling.
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

				{/* Input */}
				<div className="border-t border-gray-100 p-6">
					<form onSubmit={sendMessage} className="flex gap-4">
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Share what's on your mind..."
							className="flex-1 rounded-2xl border border-gray-200 px-6 py-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
							disabled={loading}
						/>
						<button 
							disabled={loading || !input.trim()} 
							className="btn-modern btn-primary flex-shrink-0 p-4 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}


