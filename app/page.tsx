import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sparkles, Lock, Zap, MessageSquare, Bot, Shield, Rocket, Clock, Brain } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/instreply.svg" alt="InstReply Logo" width={42} height={42} />
            <span className="text-xl font-bold">InstReply</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</Link>
            <Link href="#ai-models" className="text-sm font-medium hover:underline underline-offset-4">AI Models</Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
            <Button asChild><Link href="/signup">Sign Up</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Automate Your Social Media <span className="text-primary">with AI</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Engage with your audience using our advanced AI models. From standard responses to uncensored creativity, we&apos;ve got you covered.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Responses</h3>
                <p className="text-muted-foreground">Automatically respond to messages and comments with AI-powered intelligence</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <Bot className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Multiple AI Models</h3>
                <p className="text-muted-foreground">Choose from different AI personalities to match your brand voice</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Safety</h3>
                <p className="text-muted-foreground">Advanced content moderation to keep your responses appropriate</p>
              </div>
            </div>
          </div>
        </section>

        <section id="ai-models" className="py-20 ">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your AI Model</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Normal AI</h3>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Quick response times</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Content filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>Professional responses</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>

              <div className="flex flex-col p-6 rounded-lg border bg-card relative">
                <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                  Premium
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-semibold">Uncensored AI</h3>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <span>Creative responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <span>Casual conversation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-orange-500" />
                    <span>Personality matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span>Reduced filtering</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup">Upgrade Now</Link>
                </Button>
              </div>

              <div className="flex flex-col p-6 rounded-lg border bg-card relative">
                <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                  Enterprise
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Premium AI</h3>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-yellow-500" />
                    <span>Fastest responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-yellow-500" />
                    <span>Advanced intelligence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-yellow-500" />
                    <span>Custom AI training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <span>Enterprise security</span>
                  </li>
                </ul>
                <Button variant="secondary" asChild className="w-full">
                  <Link href="/signup">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col p-6 rounded-lg border bg-card">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>
                <div className="text-3xl font-bold mb-6">$0<span className="text-muted-foreground text-sm font-normal">/month</span></div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Normal AI Model</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>100 AI responses/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Basic moderation</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>

              <div className="flex flex-col p-6 rounded-lg border bg-card relative">
                <div className="absolute -top-2 -right-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-muted-foreground mb-6">For growing businesses</p>
                <div className="text-3xl font-bold mb-6">$29<span className="text-muted-foreground text-sm font-normal">/month</span></div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Uncensored AI Model</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>1000 AI responses/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Advanced moderation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span>Custom AI personality</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </div>

              <div className="flex flex-col p-6 rounded-lg border bg-card">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-6">For large organizations</p>
                <div className="text-3xl font-bold mb-6">Custom</div>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Premium AI Model</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Unlimited responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Enterprise security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Button variant="secondary" asChild className="w-full">
                  <Link href="/signup">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/instreply.svg" alt="InstReply Logo" width={32} height={32} />
                <span className="font-bold">InstReply</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered social media automation for modern businesses
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#ai-models">AI Models</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2024 InstReply. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
