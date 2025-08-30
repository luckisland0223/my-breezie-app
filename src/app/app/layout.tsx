import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabase = await createSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/login");
	}

	const { data: userData } = await supabase.auth.getUser();
	const email = userData.user?.email ?? "";

	const nav = [
		{ href: "/app", label: "Home" },
		{ href: "/app/chat", label: "Chat" },
		{ href: "/app/overview", label: "Overview" },
		{ href: "/app/analysis", label: "Analysis" },
		{ href: "/app/settings", label: "Settings" },
		{ href: "/app/account", label: "Account" },
	];

	return (
		<div className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg-primary)" }}>
			{/* Modern Fixed Sidebar */}
			<aside className="fixed left-0 top-0 z-40 h-screen w-72 sidebar-modern shadow-2xl md:block hidden">
				<div className="flex h-full flex-col">
					{/* Modern branding header */}
					<div className="px-8 py-8 border-b border-white/10">
						<Link href="/app" className="block group">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl animate-glow" style={{ background: "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))" }}>
									<span className="text-2xl">🌸</span>
								</div>
								<div>
									<h1 className="text-xl font-bold gradient-text">Breezie</h1>
									<p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Emotional Wellness</p>
								</div>
							</div>
						</Link>
						<div className="mt-6 p-4 glass-effect rounded-2xl">
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
									<span className="text-white text-sm font-bold">{email.charAt(0).toUpperCase()}</span>
								</div>
								<div>
									<p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{email.split('@')[0]}</p>
									<p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{email}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Modern Navigation - text only */}
					<nav className="flex-1 px-6 py-8 space-y-2">
						{nav.map((item) => (
							<Link 
								key={item.href} 
								href={item.href} 
								className="group flex items-center rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] glass-effect"
								style={{ color: "var(--color-text-primary)" }}
							>
								<span className="group-hover:font-bold transition-all duration-300">{item.label}</span>
							</Link>
						))}
					</nav>

					{/* Modern Footer */}
					<div className="px-6 py-6 border-t border-white/10">
						<Link 
							href="/auth/signout" 
							className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 hover:bg-red-500/10 hover:scale-[1.02] active:scale-[0.98] glass-effect"
							style={{ color: "var(--color-text-secondary)" }}
						>
							<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20 group-hover:bg-red-500 group-hover:shadow-lg transition-all duration-300">
								<svg className="h-5 w-5 text-red-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
							</div>
							<span className="group-hover:font-bold group-hover:text-red-600 transition-all duration-300">Sign out</span>
						</Link>
					</div>
				</div>
			</aside>
			
			{/* Main content with proper spacing for fixed sidebar */}
			<main className="flex-1 ml-72 md:ml-72 ml-0">
				<div className="min-h-screen p-8">
					{children}
				</div>
			</main>
		</div>
	);
}


