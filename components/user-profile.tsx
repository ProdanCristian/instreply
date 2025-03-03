"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserProfile() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-3">
            {session.user.image && (
                <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                />
            )}
            <div className="hidden md:block">
                <p className="text-sm font-medium">{session.user.name}</p>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                Log out
            </Button>
        </div>
    );
} 