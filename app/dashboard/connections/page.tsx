"use client"

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { ConnectionCard } from "@/components/dashboard/ConnectionCard";
import { useToast } from "@/components/ui/use-toast";

interface SocialConnection {
    platformUserId: string;
    platformUserName: string;
    platformUserAvatar: string;
}

interface Connections {
    instagram: SocialConnection | null;
    facebook: SocialConnection | null;
    tiktok: SocialConnection | null;
    threads: SocialConnection | null;
}

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connections>({
        instagram: null,
        facebook: null,
        tiktok: null,
        threads: null
    });
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            const timestamp = typeof window !== 'undefined' ? new Date().getTime() : '';
            const response = await fetch(`/api/connections?t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch connections');
            }

            const data = await response.json();
            setConnections(data);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
            toast({
                title: "Error",
                description: "Failed to fetch your social connections",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (window.location.search || window.location.hash) {
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = '';
            window.history.replaceState({}, document.title, url.toString());
        }

        fetchConnections();
    }, [fetchConnections]);

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'true') {
            console.log('Connection successful, refreshing data...');
            toast({
                title: "Success!",
                description: "Social account successfully connected",
                variant: "default",
            });
            fetchConnections();
        } else if (error) {
            console.error(`Connection error: ${error}`);
            toast({
                title: "Connection Error",
                description: `Failed to connect: ${error}`,
                variant: "destructive",
            });
        }
    }, [searchParams, fetchConnections, toast]);

    const handleConnect = async (platform: keyof typeof connections) => {
        setDisconnecting(platform);

        try {
            switch (platform) {
                case "instagram":
                    router.push("/api/connections/instagram");
                    break;
                case "threads":
                    router.push("/api/connections/threads");
                    break;
                case "facebook":
                    router.push("/api/connections/facebook");
                    break;
                case "tiktok":
                    router.push("/api/connections/tiktok");
                    break;
                default:
                    toast({
                        title: "Unsupported Platform",
                        description: `Integration with ${platform} is not supported yet`,
                        variant: "destructive",
                    });
            }
        } catch (error) {
            console.error(`Error connecting to ${platform}:`, error);
            toast({
                title: "Connection Error",
                description: `Failed to connect to ${platform}`,
                variant: "destructive",
            });
        } finally {
            setTimeout(() => setDisconnecting(null), 500);
        }
    };

    const handleDisconnect = async (platform: keyof typeof connections) => {
        try {
            setDisconnecting(platform);

            let endpoint: string;

            switch (platform) {
                case "instagram":
                    endpoint = "/api/connections/instagram";
                    break;
                case "threads":
                    endpoint = "/api/connections/threads";
                    break;
                default:
                    endpoint = `/api/connections/${platform.toLowerCase()}`;
            }

            console.log(`Disconnecting ${platform} via endpoint: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`Disconnect response status: ${response.status}`);

            if (response.ok) {
                setConnections(prev => ({
                    ...prev,
                    [platform]: null
                }));

                toast({
                    title: "Disconnected",
                    description: `Your ${platform} account has been disconnected`,
                    variant: "default",
                });
            } else {
                const errorData = await response.json();
                console.error(`Disconnect response error: ${JSON.stringify(errorData)}`);
                throw new Error(errorData.error || 'Disconnection failed');
            }
        } catch (error) {
            console.error(`Failed to disconnect ${platform}:`, error);
            toast({
                title: "Disconnection Failed",
                description: error instanceof Error ? error.message : `Could not disconnect ${platform}`,
                variant: "destructive",
            });
        } finally {
            setDisconnecting(null);
        }
    };

    const ConnectionCardSkeleton = () => (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
                <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="pt-2 pb-4">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Social Media Connections</h1>
            </div>

            <p className="text-muted-foreground mb-6">
                Connect your social media accounts to automate responses to direct messages and comments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <ConnectionCardSkeleton />
                        <ConnectionCardSkeleton />
                        <ConnectionCardSkeleton />
                        <ConnectionCardSkeleton />
                    </>
                ) : (
                    <>
                        <ConnectionCard
                            platform="instagram"
                            connection={connections.instagram}
                            loading={disconnecting === "instagram"}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                        />
                        <ConnectionCard
                            platform="facebook"
                            connection={connections.facebook}
                            loading={disconnecting === "facebook"}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                        />
                        <ConnectionCard
                            platform="tiktok"
                            connection={connections.tiktok}
                            loading={disconnecting === "tiktok"}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                        />
                        <ConnectionCard
                            platform="threads"
                            connection={connections.threads}
                            loading={disconnecting === "threads"}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                        />
                    </>
                )}
            </div>
        </div>
    );
} 