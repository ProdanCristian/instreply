import { SignupForm } from "@/components/signup-form";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
    title: "Sign Up - InstaReply",
    description: "Create your InstaReply account",
};

export default function SignupPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <Link href="/" className="mb-4">
                <div className="flex items-center justify-center">
                    <Image src="/instreply.svg" alt="InstReply Logo" width={62} height={62} />
                    <span className="text-xl font-bold">InstReply</span>
                </div>
            </Link>
            <SignupForm />
        </div>
    );
} 