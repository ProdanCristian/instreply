"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function DashboardNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(`${path}/`);
    };

    return (
        <header className="border-b">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/dashboard" className="font-semibold">
                    InstaReply
                </Link>
                <nav className="hidden md:flex items-center space-x-4">
                    <Link
                        href="/dashboard"
                        className={`text-sm font-medium transition-colors ${isActive("/dashboard") && !isActive("/dashboard/connections") &&
                                !isActive("/dashboard/automations") && !isActive("/dashboard/templates") &&
                                !isActive("/dashboard/ai-settings")
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        Overview
                    </Link>
                    <Link
                        href="/dashboard/connections"
                        className={`text-sm font-medium transition-colors ${isActive("/dashboard/connections")
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        Connections
                    </Link>
                    <Link
                        href="/dashboard/automations"
                        className={`text-sm font-medium transition-colors ${isActive("/dashboard/automations")
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        Automations
                    </Link>
                    <Link
                        href="/dashboard/templates/messages"
                        className={`text-sm font-medium transition-colors ${isActive("/dashboard/templates")
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        Templates
                    </Link>
                    <Link
                        href="/dashboard/ai-settings"
                        className={`text-sm font-medium transition-colors ${isActive("/dashboard/ai-settings")
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        AI Settings
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                        Sign out
                    </Button>
                </div>
            </div>
        </header>
    );
} 