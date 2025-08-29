import { NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(req: Request) {
	try {
		const { text } = await req.json();
		if (!text || typeof text !== "string") {
			return NextResponse.json({ error: "Missing text" }, { status: 400 });
		}
		const prompt = `Classify the user's emotional state.
Return strict JSON: {"emotion": one of ["joy","sadness","anger","fear","disgust","neutral"], "intensity": integer 1-5, "tags": string[] up to 5}.
Text: ${text}`;
		const base = env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
		const resp = await fetch(`${base}/chat/completions`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
			body: JSON.stringify({ model: env.DEEPSEEK_MODEL ?? "deepseek-chat", messages: [
				{ role: "system", content: "You are a precise emotion classifier that only returns valid JSON." },
				{ role: "user", content: prompt },
			], temperature: 0 }),
		});
		if (!resp.ok) {
			const textErr = await resp.text();
			return NextResponse.json({ error: textErr || "Upstream error" }, { status: 500 });
		}
		const data = await resp.json();
		const raw = data?.choices?.[0]?.message?.content ?? "{}";
		let parsed: any = {};
		try { parsed = JSON.parse(raw); } catch { parsed = {}; }
		return NextResponse.json(parsed);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}


