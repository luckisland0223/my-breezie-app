import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
export const metadata: Metadata = {
	  title: "Breezie - Emotional Wellness Assistant",
  description: "Intelligent emotion management and supportive conversation app",
	icons: [
		{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
		{ rel: "icon", url: "/favicon.ico" }
	],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				{children}
				<Toaster position="top-center" richColors />
				<Analytics />
			</body>
		</html>
	);
}
