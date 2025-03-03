"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";

interface Template {
    id: string;
    name: string;
    content: string;
}

export default function CommentTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([
        {
            id: '1',
            name: 'Thank You',
            content: 'Thank you for your comment! We appreciate your feedback.'
        },
        {
            id: '2',
            name: 'Question Response',
            content: 'Thanks for your question! Please DM us for more information.'
        }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTemplate, setNewTemplate] = useState<boolean>(false);
    const [templateName, setTemplateName] = useState<string>('');
    const [templateContent, setTemplateContent] = useState<string>('');

    const handleAddNew = () => {
        setNewTemplate(true);
        setEditingId(null);
        setTemplateName('');
        setTemplateContent('');
    };

    const handleEdit = (template: Template) => {
        setNewTemplate(false);
        setEditingId(template.id);
        setTemplateName(template.name);
        setTemplateContent(template.content);
    };

    const handleDelete = (id: string) => {
        setTemplates(templates.filter(template => template.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setTemplateName('');
            setTemplateContent('');
        }
    };

    const handleSave = () => {
        if (newTemplate) {
            if (templateName.trim() && templateContent.trim()) {
                setTemplates([
                    ...templates,
                    {
                        id: Date.now().toString(),
                        name: templateName,
                        content: templateContent
                    }
                ]);
                setNewTemplate(false);
                setTemplateName('');
                setTemplateContent('');
            }
        } else if (editingId) {
            setTemplates(templates.map(template =>
                template.id === editingId
                    ? { ...template, name: templateName, content: templateContent }
                    : template
            ));
            setEditingId(null);
            setTemplateName('');
            setTemplateContent('');
        }
    };

    const handleCancel = () => {
        setNewTemplate(false);
        setEditingId(null);
        setTemplateName('');
        setTemplateContent('');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Comment Templates</h1>
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                </Button>
            </div>

            <p className="text-muted-foreground mb-6">
                Create and manage templates for comment responses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Your Templates</CardTitle>
                            <CardDescription>
                                {templates.length} {templates.length === 1 ? 'template' : 'templates'} available
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`p-4 cursor-pointer hover:bg-muted transition-colors ${editingId === template.id ? 'bg-muted' : ''}`}
                                        onClick={() => handleEdit(template)}
                                    >
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-sm text-muted-foreground truncate mt-1">
                                            {template.content}
                                        </div>
                                    </div>
                                ))}

                                {templates.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No templates yet
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {newTemplate ? 'Create New Template' : editingId ? 'Edit Template' : 'Template Details'}
                            </CardTitle>
                            <CardDescription>
                                {newTemplate || editingId
                                    ? 'Fill in the details below'
                                    : 'Select a template to edit or create a new one'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(newTemplate || editingId) ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="templateName">Template Name</Label>
                                        <Input
                                            id="templateName"
                                            placeholder="e.g., Thank You"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="templateContent">Template Content</Label>
                                        <Textarea
                                            id="templateContent"
                                            placeholder="Enter your comment template..."
                                            rows={6}
                                            value={templateContent}
                                            onChange={(e) => setTemplateContent(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Keep comments concise and engaging for better interaction.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-40 text-muted-foreground">
                                    Select a template to edit or create a new one
                                </div>
                            )}
                        </CardContent>
                        {(newTemplate || editingId) && (
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <div className="flex gap-2">
                                    {editingId && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDelete(editingId)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    )}
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
} 