import { NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const prompt = `From the user's text, propose 3-6 most precise emotions with confidences (0-1). Return strict JSON: {candidates: [{label: string, confidence: number}]}. Avoid generic labels; be specific and helpful.`;
    const base = "https://api.deepseek.com";
    const resp = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [
        { role: "system", content: "You output only valid JSON as requested." },
        { role: "user", content: `${prompt}\nText: ${text}` },
      ], temperature: 0 })
    });
    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: t || "Upstream error" }, { status: 500 });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates.slice(0, 6) : [];
    return NextResponse.json({ candidates });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


