"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Facebook, MessageCircle, AtSign, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Platform = 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'THREADS';
type TemplateType = 'MESSAGE' | 'COMMENT';

interface Template {
    id: string;
    content: string;
    type: TemplateType;
}

export default function CreateAutomationPage() {
    const router = useRouter();
    const [step, setStep] = useState<number>(1);
    const [name, setName] = useState<string>('');
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentTemplate, setCurrentTemplate] = useState<string>('');
    const [currentTemplateType, setCurrentTemplateType] = useState<TemplateType>('MESSAGE');
    const [aiEnabled, setAiEnabled] = useState<boolean>(false);
    const [aiPrompt, setAiPrompt] = useState<string>('');

    const handleAddTemplate = () => {
        if (currentTemplate.trim()) {
            setTemplates([
                ...templates,
                {
                    id: Date.now().toString(),
                    content: currentTemplate,
                    type: currentTemplateType
                }
            ]);
            setCurrentTemplate('');
        }
    };

    const handleDeleteTemplate = (id: string) => {
        setTemplates(templates.filter(template => template.id !== id));
    };

    const handleSubmit = () => {
        // In a real implementation, this would save to the database
        console.log({
            name,
            platform,
            templates,
            aiEnabled,
            aiPrompt
        });

        router.push('/dashboard/automations');
    };

    const renderStep1 = () => (
        <>
            <h2 className="text-xl font-semibold mb-6">Step 1: Basic Information</h2>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Automation Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Instagram Auto-Reply"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Select Platform</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card
                            className={`cursor-pointer hover:border-primary transition-colors ${platform === 'INSTAGRAM' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPlatform('INSTAGRAM')}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Instagram className="h-10 w-10 text-pink-500 mb-2" />
                                <span>Instagram</span>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:border-primary transition-colors ${platform === 'FACEBOOK' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPlatform('FACEBOOK')}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Facebook className="h-10 w-10 text-blue-600 mb-2" />
                                <span>Facebook</span>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:border-primary transition-colors ${platform === 'TIKTOK' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPlatform('TIKTOK')}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <MessageCircle className="h-10 w-10 text-black mb-2" />
                                <span>TikTok</span>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:border-primary transition-colors ${platform === 'THREADS' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPlatform('THREADS')}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <AtSign className="h-10 w-10 text-black mb-2" />
                                <span>Threads</span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h2 className="text-xl font-semibold mb-6">Step 2: Response Templates</h2>

            <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="templateType">Template Type</Label>
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant={currentTemplateType === 'MESSAGE' ? 'default' : 'outline'}
                            onClick={() => setCurrentTemplateType('MESSAGE')}
                        >
                            Direct Message
                        </Button>
                        <Button
                            type="button"
                            variant={currentTemplateType === 'COMMENT' ? 'default' : 'outline'}
                            onClick={() => setCurrentTemplateType('COMMENT')}
                        >
                            Comment
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="template">Template Content</Label>
                    <div className="flex space-x-2">
                        <Textarea
                            id="template"
                            placeholder="Enter your response template..."
                            className="flex-1"
                            value={currentTemplate}
                            onChange={(e) => setCurrentTemplate(e.target.value)}
                        />
                        <Button type="button" onClick={handleAddTemplate}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        You can use variables like {'{name}'} to personalize your responses.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Your Templates</Label>
                    {templates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No templates added yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {templates.map(template => (
                                <div key={template.id} className="flex items-start justify-between p-3 border rounded-md">
                                    <div>
                                        <div className="text-xs font-medium mb-1">
                                            {template.type === 'MESSAGE' ? 'Direct Message' : 'Comment'}
                                        </div>
                                        <div className="text-sm">{template.content}</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteTemplate(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderStep3 = () => (
        <>
            <h2 className="text-xl font-semibold mb-6">Step 3: AI Configuration (Optional)</h2>

            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="aiEnabled"
                        checked={aiEnabled}
                        onChange={(e) => setAiEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="aiEnabled">Enable AI-generated responses</Label>
                </div>

                {aiEnabled && (
                    <div className="space-y-2">
                        <Label htmlFor="aiPrompt">AI Prompt</Label>
                        <Textarea
                            id="aiPrompt"
                            placeholder="Provide instructions for the AI..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The AI will use this prompt to generate responses when your templates don&apos;t match.
                        </p>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Create Automation</h1>
            </div>

            <div className="flex mb-8">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        1
                    </div>
                    <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                </div>
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        2
                    </div>
                    <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                </div>
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        3
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="flex justify-between mt-8">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => setStep(step - 1)}>
                                Previous
                            </Button>
                        ) : (
                            <Link href="/dashboard/automations">
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        )}

                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && (!name || !platform)}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={templates.length === 0}
                            >
                                Create Automation
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 