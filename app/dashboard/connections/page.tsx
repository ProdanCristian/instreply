"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Facebook, MessageCircle, AtSign } from "lucide-react";

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<{
        instagram: boolean;
        facebook: boolean;
        tiktok: boolean;
        threads: boolean;
    }>({
        instagram: false,
        facebook: false,
        tiktok: false,
        threads: false
    });

    const handleConnect = (platform: keyof typeof connections) => {
        // In a real implementation, this would open OAuth flow
        setConnections(prev => ({
            ...prev,
            [platform]: true
        }));
    };

    const handleDisconnect = (platform: keyof typeof connections) => {
        setConnections(prev => ({
            ...prev,
            [platform]: false
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Social Media Connections</h1>
            </div>

            <p className="text-muted-foreground mb-6">
                Connect your social media accounts to automate responses to direct messages and comments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Instagram className="h-8 w-8 text-pink-500" />
                        <div>
                            <CardTitle>Instagram</CardTitle>
                            <CardDescription>Automate DMs and comments on Instagram</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            {connections.instagram
                                ? "Connected to Instagram"
                                : "Connect your Instagram account to automate responses"}
                        </p>
                    </CardContent>
                    <CardFooter>
                        {connections.instagram ? (
                            <Button variant="destructive" onClick={() => handleDisconnect("instagram")}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button onClick={() => handleConnect("instagram")}>
                                Connect Instagram
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Facebook className="h-8 w-8 text-blue-600" />
                        <div>
                            <CardTitle>Facebook</CardTitle>
                            <CardDescription>Automate DMs and comments on Facebook</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            {connections.facebook
                                ? "Connected to Facebook"
                                : "Connect your Facebook account to automate responses"}
                        </p>
                    </CardContent>
                    <CardFooter>
                        {connections.facebook ? (
                            <Button variant="destructive" onClick={() => handleDisconnect("facebook")}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button onClick={() => handleConnect("facebook")}>
                                Connect Facebook
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MessageCircle className="h-8 w-8 text-black" />
                        <div>
                            <CardTitle>TikTok</CardTitle>
                            <CardDescription>Automate DMs and comments on TikTok</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            {connections.tiktok
                                ? "Connected to TikTok"
                                : "Connect your TikTok account to automate responses"}
                        </p>
                    </CardContent>
                    <CardFooter>
                        {connections.tiktok ? (
                            <Button variant="destructive" onClick={() => handleDisconnect("tiktok")}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button onClick={() => handleConnect("tiktok")}>
                                Connect TikTok
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AtSign className="h-8 w-8 text-black" />
                        <div>
                            <CardTitle>Threads</CardTitle>
                            <CardDescription>Automate DMs and comments on Threads</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            {connections.threads
                                ? "Connected to Threads"
                                : "Connect your Threads account to automate responses"}
                        </p>
                    </CardContent>
                    <CardFooter>
                        {connections.threads ? (
                            <Button variant="destructive" onClick={() => handleDisconnect("threads")}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button onClick={() => handleConnect("threads")}>
                                Connect Threads
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
} 