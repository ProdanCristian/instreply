"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function AiSettingsPage() {
    const [defaultPrompt, setDefaultPrompt] = useState<string>(
        "You are a helpful assistant responding to social media messages and comments. " +
        "Be friendly, concise, and helpful. If you don't know something, say so politely."
    );

    const [messagePrompt, setMessagePrompt] = useState<string>(
        "Respond to this direct message in a friendly and helpful way: {message}"
    );

    const [commentPrompt, setCommentPrompt] = useState<string>(
        "Respond to this comment in a concise and engaging way: {comment}"
    );

    const [apiKey, setApiKey] = useState<string>("");
    const [model, setModel] = useState<string>("gpt-4");

    const handleSave = () => {
        // In a real implementation, this would save to the database
        console.log({
            defaultPrompt,
            messagePrompt,
            commentPrompt,
            apiKey,
            model
        });

        alert("AI settings saved successfully!");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">AI Settings</h1>
                <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                </Button>
            </div>

            <p className="text-muted-foreground mb-6">
                Configure how AI generates responses when your templates don&apos;t match.
            </p>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>
                            Configure your AI provider settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="Enter your API key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Your API key is stored securely and never shared.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="model">AI Model</Label>
                            <select
                                id="model"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            >
                                <option value="gpt-4">GPT-4 (Most Capable)</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                                <option value="claude-3-opus">Claude 3 Opus</option>
                                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Select the AI model that will generate your responses.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prompt Templates</CardTitle>
                        <CardDescription>
                            Customize how AI generates responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="defaultPrompt">Default System Prompt</Label>
                            <Textarea
                                id="defaultPrompt"
                                placeholder="Enter default system prompt"
                                rows={4}
                                value={defaultPrompt}
                                onChange={(e) => setDefaultPrompt(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                This is the base instruction given to the AI for all responses.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="messagePrompt">Direct Message Prompt</Label>
                            <Textarea
                                id="messagePrompt"
                                placeholder="Enter message prompt template"
                                rows={3}
                                value={messagePrompt}
                                onChange={(e) => setMessagePrompt(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use {'{message}'} to include the user&apos;s message in your prompt.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="commentPrompt">Comment Prompt</Label>
                            <Textarea
                                id="commentPrompt"
                                placeholder="Enter comment prompt template"
                                rows={3}
                                value={commentPrompt}
                                onChange={(e) => setCommentPrompt(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Use {'{comment}'} to include the user&apos;s comment in your prompt.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => {
                            setDefaultPrompt("You are a helpful assistant responding to social media messages and comments. " +
                                "Be friendly, concise, and helpful. If you don't know something, say so politely.");
                            setMessagePrompt("Respond to this direct message in a friendly and helpful way: {message}");
                            setCommentPrompt("Respond to this comment in a concise and engaging way: {comment}");
                        }}>
                            Reset to Defaults
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Response Settings</CardTitle>
                        <CardDescription>
                            Configure how AI responses are generated
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="reviewBeforeSending"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="reviewBeforeSending">Review AI responses before sending</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="fallbackToAi"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                defaultChecked
                            />
                            <Label htmlFor="fallbackToAi">Use AI when no template matches</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxTokens">Maximum Response Length</Label>
                            <Input
                                id="maxTokens"
                                type="number"
                                placeholder="Maximum tokens"
                                defaultValue="150"
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum length of AI-generated responses (in tokens).
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 