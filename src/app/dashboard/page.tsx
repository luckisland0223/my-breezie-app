"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => router.push("/analytics")} className="w-full py-3 bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg">
                    查看分析
                </Button>
                <Button onClick={() => router.push("/overview")} className="w-full py-3 bg-green-500 text-white rounded-lg shadow-md hover:shadow-lg">
                    查看概览
                </Button>
                <Button onClick={() => router.push("/profile")} className="w-full py-3 bg-purple-500 text-white rounded-lg shadow-md hover:shadow-lg">
                    用户信息
                </Button>
                <Button onClick={() => router.push("/settings")} className="w-full py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:shadow-lg">
                    设置
                </Button>
            </div>
        </div>
    );
}
