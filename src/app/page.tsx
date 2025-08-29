import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		redirect("/app");
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br" style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
			<div className="container flex max-w-2xl flex-col items-center gap-6 px-6 text-center text-white">
				<h1 className="text-5xl font-extrabold">Breezie</h1>
				<p className="text-balance/loose text-lg opacity-90">feeling first, healing follows</p>
				<p className="max-w-xl opacity-80">
					Gentle AI support for your emotions. Track, reflect, and feel better—one breath at a time.
				</p>
				<Link
					className="rounded-md bg-white/90 px-4 py-2 font-medium text-gray-900 hover:bg-white"
					href="/login"
				>
					Get started →
				</Link>
			</div>
		</main>
	);
}
