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
		{ 
			href: "/app", 
			label: "Home", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
			)
		},
		{ 
			href: "/app/chat", 
			label: "Chat", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
				</svg>
			)
		},
		{ 
			href: "/app/overview", 
			label: "Overview", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			)
		},
		{ 
			href: "/app/analysis", 
			label: "Analysis", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
			)
		},
		{ 
			href: "/app/settings", 
			label: "Settings", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			)
		},
		{ 
			href: "/app/account", 
			label: "Account", 
			icon: (
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			)
		},
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
									<img 
										src="/logo-white.svg" 
										alt="Breezie" 
										className="w-7 h-7"
										onError={(e) => {
											// 如果白色logo不存在，尝试普通logo
											e.currentTarget.src = '/logo.svg';
											e.currentTarget.onerror = () => {
												// 如果都不存在，显示字母B
												e.currentTarget.style.display = 'none';
												e.currentTarget.nextElementSibling.style.display = 'block';
											};
										}}
									/>
									<span className="text-white text-xl font-bold hidden">B</span>
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

					{/* Modern Navigation */}
					<nav className="flex-1 px-6 py-8 space-y-3">
						{nav.map((item) => (
							<Link 
								key={item.href} 
								href={item.href} 
								className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] glass-effect"
								style={{ color: "var(--color-text-primary)" }}
							>
								<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/20 group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:shadow-lg transition-all duration-300">
									<span className="text-indigo-600 group-hover:text-white transition-colors duration-300">
										{item.icon}
									</span>
								</div>
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


