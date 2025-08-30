"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);

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
			{/* Modern Header */}
			<div className="mb-6 space-y-2">
				<h1 className="text-4xl font-bold tracking-tight gradient-text">💬 Chat</h1>
				<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>I'm here to listen and support you 🤗💝</p>
			</div>

			<div className="flex h-full flex-col card-modern overflow-hidden">

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-8 space-y-6">
					{messages.length === 0 && (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<div className="mb-6 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl animate-float animate-glow" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
								<span className="text-4xl">🌟</span>
							</div>
							<h3 className="mb-3 text-2xl font-semibold gradient-text">✨ Start a conversation</h3>
							<p className="text-lg max-w-md leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
								Say anything that's on your mind. I'm here to listen and support you through whatever you're feeling 💭🤗
							</p>
						</div>
					)}
				
					{messages.map((m, idx) => (
						<div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
							<div className={`flex max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
								{/* Avatar */}
								<div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
									m.role === "user" 
										? "" 
										: "bg-gray-100"
								}`} style={m.role === "user" ? { background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" } : {}}>
									{m.role === "user" ? (
										<span className="text-white text-lg">😊</span>
									) : (
										<span className="text-2xl">🤖</span>
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
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
								<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
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


