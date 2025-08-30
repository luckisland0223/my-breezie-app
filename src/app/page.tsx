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
		<main className="relative min-h-screen overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
				<div className="absolute inset-0 opacity-30" style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
				}} />
			</div>
			
			{/* Hero section */}
			<div className="relative flex min-h-screen flex-col items-center justify-center px-6">
				<div className="container flex max-w-4xl flex-col items-center gap-8 text-center text-white">
					{/* Logo/Brand */}
					<div className="animate-fade-in-up">
						<h1 className="mb-4 text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
							Breezie
						</h1>
						<div className="mx-auto h-1 w-24 rounded-full bg-white/30" />
					</div>
					
					{/* Tagline */}
					<div className="animate-fade-in-up animation-delay-200">
						<p className="text-xl font-light tracking-wide opacity-95 sm:text-2xl">
							feeling first, healing follows
						</p>
					</div>
					
					{/* Description */}
					<div className="animate-fade-in-up animation-delay-400 max-w-2xl">
						<p className="text-lg leading-relaxed opacity-85 sm:text-xl">
							Gentle AI support for your emotions. Track, reflect, and feel better—one breath at a time.
						</p>
					</div>
					
					{/* CTA Button */}
					<div className="animate-fade-in-up animation-delay-600">
						<Link
							className="group relative inline-flex items-center gap-2 rounded-full bg-white/95 px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
							href="/login"
						>
							Get started
							<svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				</div>
				
				{/* Features preview */}
				<div className="animate-fade-in-up animation-delay-800 mt-16 grid max-w-4xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
					<div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
							<svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-white">AI Chat Support</h3>
						<p className="text-sm text-white/80">Gentle conversations that understand your emotions</p>
					</div>
					<div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
							<svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-white">Mood Tracking</h3>
						<p className="text-sm text-white/80">Simple daily check-ins with insightful trends</p>
					</div>
					<div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
							<svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-white">Personal Insights</h3>
						<p className="text-sm text-white/80">Discover patterns and build healthier habits</p>
					</div>
				</div>
			</div>
		</main>
	);
}
