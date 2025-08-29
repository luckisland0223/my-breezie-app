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
		<div className="flex min-h-screen">
			<aside className="hidden w-64 shrink-0 border-r bg-white p-4 md:block">
				<div className="mb-6">
					<Link href="/app" className="text-xl font-semibold">
						<span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, var(--color-brand-start), var(--color-brand-end))" }}>Breezie</span>
					</Link>
					<p className="mt-1 text-xs text-gray-500">{email}</p>
				</div>
				<nav className="space-y-1">
					{nav.map((n) => (
						<Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
							{n.label}
						</Link>
					))}
				</nav>
				<div className="mt-8 border-t pt-4">
					<Link href="/auth/signout" className="text-sm text-gray-600 hover:text-gray-900">
						Sign out
					</Link>
				</div>
			</aside>
			<main className="flex-1 p-4 md:ml-0">{children}</main>
		</div>
	);
}


