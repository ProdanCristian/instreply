"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Instagram, Facebook, MessageCircle, AtSign, Edit, Trash2, Power } from "lucide-react";

type Automation = {
    id: string;
    name: string;
    platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'THREADS';
    isActive: boolean;
    messageCount: number;
    commentCount: number;
    aiEnabled: boolean;
};

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<Automation[]>([
        {
            id: '1',
            name: 'Instagram Auto-Reply',
            platform: 'INSTAGRAM',
            isActive: true,
            messageCount: 3,
            commentCount: 0,
            aiEnabled: false
        }
    ]);

    const getPlatformIcon = (platform: Automation['platform']) => {
        switch (platform) {
            case 'INSTAGRAM':
                return <Instagram className="h-5 w-5 text-pink-500" />;
            case 'FACEBOOK':
                return <Facebook className="h-5 w-5 text-blue-600" />;
            case 'TIKTOK':
                return <MessageCircle className="h-5 w-5 text-black" />;
            case 'THREADS':
                return <AtSign className="h-5 w-5 text-black" />;
        }
    };

    const toggleAutomation = (id: string) => {
        setAutomations(prev =>
            prev.map(automation =>
                automation.id === id
                    ? { ...automation, isActive: !automation.isActive }
                    : automation
            )
        );
    };

    const deleteAutomation = (id: string) => {
        setAutomations(prev => prev.filter(automation => automation.id !== id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Automations</h1>
                <Link href="/dashboard/automations/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Automation
                    </Button>
                </Link>
            </div>

            <p className="text-muted-foreground mb-6">
                Create and manage your social media response automations.
            </p>

            {automations.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 flex flex-col items-center justify-center">
                        <p className="text-muted-foreground mb-4 text-center">
                            You haven&apos;t created any automations yet.
                        </p>
                        <Link href="/dashboard/automations/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Automation
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {automations.map(automation => (
                        <Card key={automation.id} className="overflow-hidden">
                            <div className={`h-1 ${automation.isActive ? 'bg-green-500' : 'bg-gray-200'}`} />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon(automation.platform)}
                                        <CardTitle>{automation.name}</CardTitle>
                                    </div>
                                    <Button
                                        variant={automation.isActive ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleAutomation(automation.id)}
                                    >
                                        <Power className="h-4 w-4 mr-1" />
                                        {automation.isActive ? 'Active' : 'Inactive'}
                                    </Button>
                                </div>
                                <CardDescription>
                                    {automation.platform.charAt(0) + automation.platform.slice(1).toLowerCase()} automation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">{automation.messageCount}</span> message templates
                                    </div>
                                    <div>
                                        <span className="font-medium">{automation.commentCount}</span> comment templates
                                    </div>
                                    <div>
                                        AI: <span className="font-medium">{automation.aiEnabled ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/automations/${automation.id}`}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteAutomation(automation.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 