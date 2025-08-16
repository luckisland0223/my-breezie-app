import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
	title: "Breezie - 情绪疏导AI助手",
	description: "feeling first, healing follows - 通过AI聊天帮助您疏导情绪，记录和分析情绪变化",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh-CN" className={`${geist.variable}`}>
			<body className="antialiased">
				<MainLayout>
					{children}
				</MainLayout>
				<Toaster position="top-center" richColors />
			</body>
		</html>
	);
}
