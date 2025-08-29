import { NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const messages = body?.messages ?? [];
		if (!Array.isArray(messages)) {
			return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
		}

		const base = env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
		const resp = await fetch(`${base}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
			},
			body: JSON.stringify({
				model: env.DEEPSEEK_MODEL ?? "deepseek-chat",
				messages,
				stream: false,
			}),
		});

		if (!resp.ok) {
			const text = await resp.text();
			return NextResponse.json({ error: text || "Upstream error" }, { status: 500 });
		}

		const data = await resp.json();
		const reply = data?.choices?.[0]?.message?.content ?? "";
		return NextResponse.json({ reply });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}


