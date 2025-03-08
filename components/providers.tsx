"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Session } from "next-auth";

type ProvidersProps = {
    children: React.ReactNode;
    session?: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
} 