"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Free",
        id: "free",
        href: "#",
        price: { monthly: "$0" },
        description: "Perfect for getting started",
        features: [
            "Normal AI Model",
            "100 AI responses/month",
            "Basic moderation",
            "1 social account",
        ],
        mostPopular: false,
    },
    {
        name: "Premium",
        id: "premium",
        href: "#",
        price: { monthly: "$29" },
        description: "For growing businesses",
        features: [
            "Uncensored AI Model",
            "1000 AI responses/month",
            "Advanced moderation",
            "Custom AI personality",
            "5 social accounts",
            "Priority support",
        ],
        mostPopular: true,
    },
    {
        name: "Enterprise",
        id: "enterprise",
        href: "#",
        price: { monthly: "Custom" },
        description: "For large organizations",
        features: [
            "Premium AI Model",
            "Unlimited responses",
            "Enterprise security",
            "Custom integrations",
            "Unlimited social accounts",
            "24/7 priority support",
            "Dedicated account manager",
        ],
        mostPopular: false,
    },
];

export default function BillingPage() {
    const { data: session } = useSession();

    return (
        <div className="container max-w-7xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Billing & Plans</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and billing information
                </p>
            </div>

            {/* Current Subscription */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                        You are currently on the Free plan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Billing Period</p>
                            <p className="text-sm text-muted-foreground">Monthly</p>
                        </div>
                        <div>
                            <p className="font-medium">Next Payment</p>
                            <p className="text-sm text-muted-foreground">N/A</p>
                        </div>
                        <div>
                            <p className="font-medium">AI Responses Used</p>
                            <p className="text-sm text-muted-foreground">23/100</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">
                        View Invoice History
                    </Button>
                </CardFooter>
            </Card>

            {/* Available Plans */}
            <div className="grid gap-6 lg:grid-cols-3">
                {tiers.map((tier) => (
                    <Card
                        key={tier.id}
                        className={cn(
                            tier.mostPopular
                                ? "border-primary shadow-lg"
                                : "bg-background",
                            "relative flex flex-col"
                        )}
                    >
                        {tier.mostPopular && (
                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground">
                                Most popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle>{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-4">
                                <span className="text-3xl font-bold">{tier.price.monthly}</span>
                                {tier.price.monthly !== "Custom" && (
                                    <span className="text-muted-foreground">/month</span>
                                )}
                            </div>
                            <ul className="space-y-2.5">
                                {tier.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant={tier.mostPopular ? "default" : "outline"}
                                className="w-full"
                            >
                                {tier.id === "enterprise" ? (
                                    "Contact Sales"
                                ) : tier.id === "free" ? (
                                    "Current Plan"
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Upgrade Plan
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
} 