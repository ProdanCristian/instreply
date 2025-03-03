"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media Accounts</CardTitle>
                        <CardDescription>Connect your social media accounts to automate responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">No accounts connected yet</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/dashboard/connections">
                            <Button>Manage Connections</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Automations</CardTitle>
                        <CardDescription>Your currently active response automations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">No active automations</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/dashboard/automations">
                            <Button>Manage Automations</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Message Templates</CardTitle>
                        <CardDescription>Create and manage message templates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">0 templates</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/dashboard/templates/messages">
                            <Button variant="outline">View Templates</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Comment Templates</CardTitle>
                        <CardDescription>Create and manage comment templates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">0 templates</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/dashboard/templates/comments">
                            <Button variant="outline">View Templates</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Assistant</CardTitle>
                        <CardDescription>Configure AI to generate responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Not configured</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/dashboard/ai-settings">
                            <Button variant="outline">Configure AI</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
} 