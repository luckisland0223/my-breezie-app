import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
export const metadata: Metadata = {
	title: "Breezie - 你的情绪健康助手",
	description: "专业的情绪管理App，帮助你建立更健康的心理状态。即将在App Store发布，立即注册获取发布通知。",
	keywords: ["情绪管理", "心理健康", "情绪追踪", "AI助手", "冥想", "减压"],
	authors: [{ name: "Breezie Team" }],
	creator: "Breezie",
	publisher: "Breezie",
	robots: "index, follow",
	icons: [
		{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
		{ rel: "icon", url: "/favicon.ico" }
	],
	openGraph: {
		title: "Breezie - 你的情绪健康助手",
		description: "专业的情绪管理App，帮助你建立更健康的心理状态。即将在App Store发布。",
		type: "website",
		locale: "zh_CN",
	},
	twitter: {
		card: "summary_large_image",
		title: "Breezie - 你的情绪健康助手",
		description: "专业的情绪管理App，帮助你建立更健康的心理状态。",
	}
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
