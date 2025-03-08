"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Link2,
    PlayCircle,
    Settings2,
    LogOut,
    CreditCard,
    User
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routes = [
    {
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: 'text-sky-500',
        exact: true
    },
    {
        label: 'Connections',
        icon: Link2,
        href: '/dashboard/connections',
        color: 'text-violet-500',
    },
    {
        label: 'Automations',
        icon: PlayCircle,
        color: 'text-pink-700',
        href: '/dashboard/automations',
    },
    {
        label: 'AI Settings',
        icon: Settings2,
        href: '/dashboard/ai-settings',
        color: 'text-green-500',
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isRouteActive = (route: typeof routes[0]) => {
        if (route.exact) {
            return pathname === route.href;
        }
        return pathname === route.href || pathname?.startsWith(route.href + "/");
    };

    const getInitials = (name: string) => {
        return name?.split(' ')[0]?.[0]?.toUpperCase() || '?';
    };

    const userImage = session?.user?.image;
    const userName = session?.user?.name || 'User';
    const userEmail = session?.user?.email || '';
    const isGoogleAuth = session?.user?.image?.includes('googleusercontent.com');

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col h-full bg-background border-r">
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14 mt-6">
                    <Image src="/instreply.svg" alt="InstReply Logo" width={42} height={42} className="mr-2" />
                    <h1 className="text-xl font-bold">
                        InstReply
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg transition",
                                isRouteActive(route)
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground",
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full p-3 rounded-lg hover:bg-accent transition">
                            <div className="flex items-center gap-3 min-w-0 w-full">
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    {isGoogleAuth && userImage ? (
                                        <Image
                                            src={userImage}
                                            alt={`${userName}'s avatar`}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                            {getInitials(userName)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium truncate text-left">{userName}</span>
                                    <span className="text-xs text-muted-foreground truncate text-left">{userEmail}</span>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" alignOffset={-40} forceMount>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/account" className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Account & Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/billing" className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Billing & Plans
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-rose-500 focus:text-rose-500 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
} 