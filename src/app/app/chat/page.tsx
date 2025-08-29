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
		<div className="mx-auto flex h-[calc(100vh-2rem)] max-w-3xl flex-col">
			<div className="flex-1 space-y-3 overflow-y-auto rounded-md border p-4">
				{messages.length === 0 && (
					<p className="text-sm text-gray-500">Say anything that's on your mind. I'm here with you.</p>
				)}
				{messages.map((m, idx) => (
					<div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
						<span
							className={
								"inline-block max-w-[85%] rounded-lg px-3 py-2 " +
								(m.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-900")
							}
						>
							{m.content}
						</span>
					</div>
				))}
				{loading && <p className="text-sm text-gray-400">Thinking…</p>}
			</div>
			<form onSubmit={sendMessage} className="mt-3 flex gap-2">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message"
					className="min-h-10 flex-1 rounded-md border px-3 py-2"
				/>
				<button disabled={loading} className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
					Send
				</button>
			</form>
		</div>
	);
}


