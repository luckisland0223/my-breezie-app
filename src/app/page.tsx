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
		<main className="min-h-screen hero-modern">
			{/* Modern Hero Section */}
			<div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 z-10">
				<div className="container max-w-5xl mx-auto text-center space-y-12">
					
					{/* Logo and Brand */}
					                            <div className="space-y-8 animate-fade-in-up">
                                <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl shadow-2xl animate-float animate-glow" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
                                    <span className="text-6xl">🌸</span>
                                </div>
						<div className="space-y-6">
							<h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white animate-gradient">
								Breezie
							</h1>
							<p className="text-2xl sm:text-3xl font-light text-white/90">
								feeling first, healing follows
							</p>
						</div>
					</div>
					
					{/* Description */}
					<div className="animate-fade-in-up animation-delay-200 max-w-4xl mx-auto">
						<p className="text-xl sm:text-2xl leading-relaxed text-white/80 font-light">
							Gentle AI support for your emotions. Track, reflect, and feel better—one breath at a time.
						</p>
					</div>
					
					                            {/* CTA Button */}
                            <div className="animate-fade-in-up animation-delay-400">
                                <Link
                                    className="btn-modern inline-flex items-center gap-4 px-12 py-5 text-xl font-bold"
                                    href="/login"
                                >
                                    <span className="text-2xl">🚀</span>
                                    Get Started
                                    <span className="text-2xl">💫</span>
                                </Link>
                            </div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-24 px-6" style={{ backgroundColor: "var(--color-bg-primary)" }}>
				<div className="container max-w-6xl mx-auto">
					<div className="text-center mb-20 space-y-6 animate-fade-in-up">
						<h2 className="text-4xl sm:text-5xl font-bold gradient-text">
							Everything you need for emotional wellness
						</h2>
						<p className="text-xl" style={{ color: "var(--color-text-secondary)" }}>
							Simple tools to help you understand and improve your mental health
						</p>
					</div>
					
					                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="card-modern p-10 text-center space-y-8 animate-fade-in-up animation-delay-200">
                                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl animate-float">
                                        <span className="text-4xl">🤗</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4 gradient-text">🤖 AI Chat Support</h3>
                                        <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                            Gentle conversations that understand your emotions and provide caring support 💝
                                        </p>
                                    </div>
                                </div>

                                <div className="card-modern p-10 text-center space-y-8 animate-fade-in-up animation-delay-400">
                                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl animate-float">
                                        <span className="text-4xl">📈</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4 gradient-text">📊 Mood Tracking</h3>
                                        <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                            Simple daily check-ins with beautiful insights and progress tracking 📱
                                        </p>
                                    </div>
                                </div>

                                <div className="card-modern p-10 text-center space-y-8 animate-fade-in-up animation-delay-600">
                                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl animate-float">
                                        <span className="text-4xl">🔮</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4 gradient-text">✨ Personal Insights</h3>
                                        <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                            Discover patterns and build healthier emotional habits over time 🌱
                                        </p>
                                    </div>
                                </div>
                            </div>
				</div>
			</div>
		</main>
	);
}