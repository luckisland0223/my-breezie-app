import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/env";

export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: Record<string, unknown>) {
					try {
						cookieStore.set({ name, value, ...options } as any);
					} catch {}
				},
				remove(name: string, options: Record<string, unknown>) {
					try {
						cookieStore.set({ name, value: "", maxAge: 0, ...options } as any);
					} catch {}
				},
			},
		},
	);
}


