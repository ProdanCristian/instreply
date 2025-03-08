"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Lock, Zap } from "lucide-react";

export default function AISettingsPage() {
    const [selectedAI, setSelectedAI] = useState("normal");
    const [autoModeration, setAutoModeration] = useState(true);

    const handleSaveSettings = () => {
        // TODO: Save AI settings to backend
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">AI Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your AI assistant preferences</p>
                </div>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Model Selection</CardTitle>
                        <CardDescription>Choose the AI model that best fits your needs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedAI} onValueChange={setSelectedAI} className="grid gap-4">
                            <div className="flex items-center space-x-4 rounded-lg border p-4">
                                <RadioGroupItem value="normal" id="normal" />
                                <Label htmlFor="normal" className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-blue-500" />
                                        <span className="font-semibold">Normal AI</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Standard AI model with content filtering and safety measures
                                    </p>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-4 rounded-lg border p-4">
                                <RadioGroupItem value="uncensored" id="uncensored" />
                                <Label htmlFor="uncensored" className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-orange-500" />
                                        <span className="font-semibold">Uncensored AI</span>
                                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Premium</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Reduced content filtering for more creative responses
                                    </p>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-4 rounded-lg border p-4">
                                <RadioGroupItem value="premium" id="premium" />
                                <Label htmlFor="premium" className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                        <span className="font-semibold">Premium AI</span>
                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Enterprise</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Advanced AI model with enhanced capabilities and faster response times
                                    </p>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Behavior Settings</CardTitle>
                        <CardDescription>Configure how the AI interacts with your audience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Automatic Content Moderation</Label>
                                <p className="text-sm text-muted-foreground">
                                    Filter inappropriate content from AI responses
                                </p>
                            </div>
                            <Switch
                                checked={autoModeration}
                                onCheckedChange={setAutoModeration}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 