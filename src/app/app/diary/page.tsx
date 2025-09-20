"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DiaryPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const router = useRouter();

  async function analyzeAndMaybeCounsel() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/emotion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: content }) });
      const json = res.ok ? await res.json() : {};
      const emo = String(json?.emotion ?? "");
      const neg = ["sadness","anger","fear","disgust"].includes(emo);
      setEmotion(emo || null);
      setIntensity(Number(json?.intensity ?? 3));
      if (neg) {
        const proceed = window.confirm("检测到可能的消极情绪，是否进行情绪疏导？");
        if (proceed) {
          router.push(`/app/chat?q=${encodeURIComponent(content)}`);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveDiary() {
    setLoading(true);
    try {
      await fetch("/api/emotion/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "diary",
          pre_emotion: emotion,
          pre_intensity: intensity,
          post_emotion: emotion,
          post_intensity: intensity,
          content,
        }),
      });
      setContent("");
      setEmotion(null);
      setIntensity(3);
      alert("已保存日记");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // autofocus
    const ta = document.getElementById("diary-ta") as HTMLTextAreaElement | null;
    ta?.focus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Diary</h1>
        <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>Write freely. We’ll help you reflect.</p>
      </div>
      <div className="card-modern p-6 space-y-4">
        <textarea
          id="diary-ta"
          className="w-full min-h-[200px] rounded-2xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center gap-4">
          <button onClick={analyzeAndMaybeCounsel} disabled={!content.trim() || loading} className="btn-modern btn-primary px-4 py-2 disabled:opacity-50">Analyze</button>
          <button onClick={saveDiary} disabled={!content.trim() || loading} className="rounded-xl border border-gray-200 px-4 py-2">Save diary</button>
        </div>
        {(emotion || intensity) && (
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Detected emotion</p>
            <div className="flex items-center gap-4 mt-2">
              <input value={emotion ?? ""} onChange={(e) => setEmotion(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2" placeholder="emotion" />
              <input type="range" min={1} max={5} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
              <span className="text-sm">{intensity}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


