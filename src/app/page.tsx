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
		<main className="min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
			{/* Apple-style Hero Section */}
			<div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
				<div className="container max-w-5xl mx-auto text-center space-y-12">
					
					{/* Logo and Brand */}
					<div className="space-y-6 animate-fade-in-up">
						<div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-xl" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
							{/* 你可以将这里的emoji替换为真实logo */}
							<img 
								src="/logo.svg" 
								alt="Breezie Logo" 
								className="w-12 h-12"
								onError={(e) => {
									// 如果logo文件不存在，显示emoji作为后备
									e.currentTarget.style.display = 'none';
									e.currentTarget.nextElementSibling.style.display = 'block';
								}}
							/>
							<span className="text-4xl hidden">🌱</span>
						</div>
						<div className="space-y-4">
							<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
								Breezie
							</h1>
							<p className="text-xl sm:text-2xl font-light" style={{ color: "var(--color-text-secondary)" }}>
								feeling first, healing follows
							</p>
						</div>
					</div>
					
					{/* Description */}
					<div className="animate-fade-in-up animation-delay-200 max-w-3xl mx-auto">
						<p className="text-lg sm:text-xl leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
							Gentle AI support for your emotions. Track, reflect, and feel better—one breath at a time.
						</p>
					</div>
					
					{/* CTA Button */}
					<div className="animate-fade-in-up animation-delay-400">
						<Link
							className="btn-modern btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold"
							href="/login"
						>
							Get Started
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</Link>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-20 px-6">
				<div className="container max-w-6xl mx-auto">
					<div className="text-center mb-16 space-y-4">
						<h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
							Everything you need for emotional wellness
						</h2>
						<p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
							Simple tools to help you understand and improve your mental health
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="card-modern p-8 text-center space-y-6">
							<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
								<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>AI Chat Support</h3>
								<p style={{ color: "var(--color-text-secondary)" }}>
									Gentle conversations that understand your emotions and provide caring support
								</p>
							</div>
						</div>

						<div className="card-modern p-8 text-center space-y-6">
							<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
								<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Mood Tracking</h3>
								<p style={{ color: "var(--color-text-secondary)" }}>
									Simple daily check-ins with beautiful insights and progress tracking
								</p>
							</div>
						</div>

						<div className="card-modern p-8 text-center space-y-6">
							<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
								<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
							<div>
								<h3 className="text-xl font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Personal Insights</h3>
								<p style={{ color: "var(--color-text-secondary)" }}>
									Discover patterns and build healthier emotional habits over time
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}