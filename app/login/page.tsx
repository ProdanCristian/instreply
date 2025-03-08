import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login - InstaReply",
  description: "Login to your InstaReply account",
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Link href="/" className="mb-4">
        <div className="flex  items-center justify-center">
          <Image src="/instreply.svg" alt="InstReply Logo" width={62} height={62} />
          <span className="text-xl font-bold">InstReply</span>
        </div>
      </Link>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm className="w-full max-w-[800px]" />
      </Suspense>
    </div>
  );
}
