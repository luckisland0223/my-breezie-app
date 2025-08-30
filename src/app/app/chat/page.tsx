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
		<div className="flex h-[calc(100vh-3rem)] max-w-4xl mx-auto flex-col bg-white rounded-xl shadow-sm border">
			{/* Header */}
			<div className="border-b border-gray-200 p-4">
				<h1 className="text-xl font-semibold text-gray-900">Chat with Breezie</h1>
				<p className="text-sm text-gray-600">I'm here to listen and support you</p>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<div className="mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-4">
							<svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-medium text-gray-900">Start a conversation</h3>
						<p className="text-gray-600 max-w-md">
							Say anything that's on your mind. I'm here to listen and support you through whatever you're feeling.
						</p>
					</div>
				)}
				
				{messages.map((m, idx) => (
					<div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
						<div className={`flex max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
							{/* Avatar */}
							<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
								m.role === "user" 
									? "bg-gradient-to-r from-blue-500 to-purple-500" 
									: "bg-gray-100"
							}`}>
								{m.role === "user" ? (
									<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
									</svg>
								) : (
									<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									</svg>
								)}
							</div>
							
							{/* Message bubble */}
							<div className={`rounded-2xl px-4 py-3 ${
								m.role === "user" 
									? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
									: "bg-gray-100 text-gray-900"
							}`}>
								<p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
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
			<div className="border-t border-gray-200 p-4">
				<form onSubmit={sendMessage} className="flex gap-3">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Share what's on your mind..."
						className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
						disabled={loading}
					/>
					<button 
						disabled={loading || !input.trim()} 
						className="flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
						</svg>
					</button>
				</form>
			</div>
		</div>
	);
}


