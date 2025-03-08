import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialIcon } from "react-social-icons";

interface SocialConnection {
    platformUserId: string;
    platformUserName: string;
    platformUserAvatar: string;
}

interface ConnectionCardProps {
    platform: "instagram" | "facebook" | "tiktok" | "threads";
    connection: SocialConnection | null;
    loading: boolean;
    onConnect: (platform: "instagram" | "facebook" | "tiktok" | "threads") => void;
    onDisconnect: (platform: "instagram" | "facebook" | "tiktok" | "threads") => void;
}

export function ConnectionCard({ platform, connection, loading, onConnect, onDisconnect }: ConnectionCardProps) {
    const getPlatformIcon = () => {
        return (
            <div className="flex items-center justify-center">
                <SocialIcon
                    network={platform}
                    style={{ height: 32, width: 32 }}
                    fgColor={
                        platform === "instagram" ? "#ffffff" :
                            platform === "facebook" ? "#ffffff" :
                                platform === "tiktok" ? "#ffffff" :
                                    platform === "threads" ? "#ffffff" : undefined
                    }
                />
            </div>
        );
    };

    const getPlatformTitle = () => {
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    };

    const getFallback = () => {
        switch (platform) {
            case 'instagram': return 'IG';
            case 'facebook': return 'FB';
            case 'tiktok': return 'TT';
            case 'threads': return 'TH';
        }
    };

    return (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-200 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                <div className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm">
                    {getPlatformIcon()}
                </div>
                <div className="flex-1">
                    <CardTitle className="text-lg font-medium">{getPlatformTitle()}</CardTitle>
                </div>
                {connection && (
                    <Avatar className="h-9 w-9 ring-2 ring-slate-200 dark:ring-slate-700">
                        <AvatarImage src={connection.platformUserAvatar} />
                        <AvatarFallback>{getFallback()}</AvatarFallback>
                    </Avatar>
                )}
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
                {connection ? (
                    <div className="flex items-center">
                        <span className="text-sm mr-1 text-slate-600 dark:text-slate-400">Connected as</span>
                        <span className="text-sm font-bold">@{connection.platformUserName}</span>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Connect your {getPlatformTitle()} account to automate responses
                    </p>
                )}
            </CardContent>
            <CardFooter className="pt-2 pb-4 mt-auto">
                {connection ? (
                    <Button
                        variant="destructive"
                        onClick={() => onDisconnect(platform)}
                        disabled={loading}
                        className="w-full"
                    >
                        Disconnect
                    </Button>
                ) : (
                    <Button
                        onClick={() => onConnect(platform)}
                        disabled={loading}
                        className="w-full "
                    >
                        Connect {getPlatformTitle()}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}