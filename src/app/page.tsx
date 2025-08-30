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
		<main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg-primary)" }}>
			{/* Modern animated background */}
			<div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
				{/* Floating elements background */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-10 w-16 h-16 bg-white rounded-full animate-subtle-bounce animation-delay-200"></div>
					<div className="absolute top-40 right-20 w-12 h-12 bg-white rounded-full animate-subtle-bounce animation-delay-400"></div>
					<div className="absolute bottom-40 left-20 w-20 h-20 bg-white rounded-full animate-subtle-bounce animation-delay-600"></div>
					<div className="absolute bottom-20 right-10 w-14 h-14 bg-white rounded-full animate-subtle-bounce animation-delay-800"></div>
					<div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full animate-subtle-bounce animation-delay-400"></div>
					<div className="absolute top-1/3 right-1/3 w-10 h-10 bg-white rounded-full animate-subtle-bounce animation-delay-600"></div>
				</div>
			</div>
			
			{/* Hero section */}
			<div className="relative flex min-h-screen flex-col items-center justify-center px-6">
				<div className="container flex max-w-4xl flex-col items-center gap-8 text-center text-white">
					{/* Logo/Brand with friendly mascot */}
					<div className="animate-subtle-bounce">
						{/* Cute mascot-style icon */}
						<div className="mb-6 inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-md animate-subtle-bounce">
							<div className="text-6xl">🌱</div>
						</div>
						<h1 className="mb-4 text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl drop-shadow-md" style={{ color: "var(--color-text-primary)" }}>
							Breezie
						</h1>
						<div className="mx-auto h-2 w-32 rounded-full bg-white/40 shadow-md" />
					</div>
					
					{/* Tagline */}
					<div className="animate-fade-in-up animation-delay-200">
						<p className="text-xl font-light tracking-wide opacity-95 sm:text-2xl" style={{ color: "var(--color-text-secondary)" }}>
							feeling first, healing follows
						</p>
					</div>
					
					{/* Description */}
					<div className="animate-fade-in-up animation-delay-400 max-w-2xl">
						<p className="text-lg leading-relaxed opacity-85 sm:text-xl" style={{ color: "var(--color-text-secondary)" }}>
							Gentle AI support for your emotions. Track, reflect, and feel better—one breath at a time.
						</p>
					</div>
					
					{/* CTA Button - Modern style */}
					<div className="animate-subtle-bounce animation-delay-600">
						<Link
							className="btn-modern btn-primary group relative inline-flex items-center gap-3 px-12 py-5 text-xl font-bold shadow-md hover:animate-subtle-bounce"
							href="/login"
						>
							<span className="text-2xl">🚀</span>
							Get started
							<svg className="h-6 w-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				</div>
				
				{/* Features preview - Modern style cards */}
				<div className="animate-fade-in-up animation-delay-800 mt-16 grid max-w-4xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
					<div className="card-modern p-8 bg-white/15 backdrop-blur-sm border-white/20 hover:bg-white/20">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/30 shadow-md">
							<span className="text-3xl">💬</span>
						</div>
						<h3 className="mb-3 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>AI Chat Support</h3>
						<p className="text-white/90 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Gentle conversations that understand your emotions and provide caring support</p>
					</div>
					<div className="card-modern p-8 bg-white/15 backdrop-blur-sm border-white/20 hover:bg-white/20">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/30 shadow-md">
							<span className="text-3xl">📊</span>
						</div>
						<h3 className="mb-3 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Mood Tracking</h3>
						<p className="text-white/90 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Simple daily check-ins with beautiful insights and progress tracking</p>
					</div>
					<div className="card-modern p-8 bg-white/15 backdrop-blur-sm border-white/20 hover:bg-white/20">
						<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/30 shadow-md">
							<span className="text-3xl">✨</span>
						</div>
						<h3 className="mb-3 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Personal Insights</h3>
						<p className="text-white/90 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Discover patterns and build healthier emotional habits over time</p>
					</div>
				</div>
			</div>
		</main>
	);
}
