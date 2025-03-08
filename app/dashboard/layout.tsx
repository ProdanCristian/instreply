import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login?callbackUrl=/dashboard");
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
} 