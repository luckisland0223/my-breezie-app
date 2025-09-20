import { NextResponse } from "next/server";
import { env } from "@/env";

export const runtime = "edge";

export async function POST(req: Request) {
	const body = await req.json().catch(() => null);
	const messages = body?.messages ?? [];
	if (!Array.isArray(messages)) {
		return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
	}

	// Avoid runtime crash if the key is not configured in production
	if (!env.DEEPSEEK_API_KEY) {
		return NextResponse.json({ error: "Server not configured: missing DEEPSEEK_API_KEY" }, { status: 503 });
	}

	const base = "https://api.deepseek.com";
	const upstream = await fetch(`${base}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
		},
		body: JSON.stringify({ model: "deepseek-chat", messages, stream: true }),
	});

	if (!upstream.ok || !upstream.body) {
		const text = await upstream.text().catch(() => "");
		return NextResponse.json({ error: text || "Upstream error" }, { status: 500 });
	}

	const stream = new ReadableStream({
		start(controller) {
			const reader = upstream.body!.getReader();
			const decoder = new TextDecoder();
			function push() {
				reader.read().then(({ done, value }) => {
					if (done) {
						controller.close();
						return;
					}
					const chunk = decoder.decode(value, { stream: true });
					for (const line of chunk.split("\n")) {
						const trimmed = line.trim();
						if (!trimmed.startsWith("data:")) continue;
						const payload = trimmed.replace(/^data:\s*/, "");
						if (payload === "[DONE]") continue;
						try {
							const json = JSON.parse(payload);
							const token = json?.choices?.[0]?.delta?.content ?? "";
							if (token) controller.enqueue(new TextEncoder().encode(token));
						} catch {}
					}
					push();
				});
			}
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}


