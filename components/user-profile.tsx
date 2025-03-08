"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function UserProfile() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-3">
            {session.user.image && (
                <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                    width={32}
                    height={32}
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