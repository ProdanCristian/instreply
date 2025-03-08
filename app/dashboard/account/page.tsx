"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Moon, Sun } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const accountFormSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: "Name must be at least 2 characters.",
        })
        .max(30, {
            message: "Name must not be longer than 30 characters.",
        }),
    email: z
        .string()
        .min(1, { message: "This field is required" })
        .email("This is not a valid email"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountPage() {
    const { data: session, update: updateSession } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [settings, setSettings] = useState({
        emailNotifications: true,
    });

    const defaultValues: Partial<AccountFormValues> = {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
    };

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountFormSchema),
        defaultValues,
    });

    useEffect(() => {
        setMounted(true);
        fetchUserSettings();
        if (session?.user) {
            form.reset({
                name: session.user.name || "",
                email: session.user.email || "",
            });
        }
    }, [session, form]);

    const fetchUserSettings = async () => {
        setIsSettingsLoading(true);
        try {
            console.log('Fetching user settings...');
            const response = await fetch('/api/user/settings');
            if (response.ok) {
                const data = await response.json();
                console.log('User settings fetched:', data);
                setSettings(prevSettings => ({
                    ...prevSettings,
                    emailNotifications: data.emailNotificationsEnabled
                }));
            } else {
                console.error('Failed to fetch settings, status:', response.status);
                throw new Error('Failed to fetch settings');
            }
        } catch (error) {
            console.error('Failed to fetch user settings:', error);
            toast({
                title: "Error",
                description: "Failed to load your settings. Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setIsSettingsLoading(false);
        }
    };

    const handleSettingChange = async (key: string, value: string | boolean) => {
        setIsSettingsLoading(true);
        try {
            if (key === "theme") {
                setTheme(value as string);
            } else if (key === "emailNotifications") {
                setSettings((prev) => ({ ...prev, emailNotifications: value as boolean }));

                console.log('Updating email notifications setting to:', value);
                const response = await fetch('/api/user/settings', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emailNotifications: value,
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to update settings, status:', response.status);
                    throw new Error('Failed to update settings');
                }

                const data = await response.json();
                console.log('Settings update response:', data);
            } else {
                setSettings((prev) => ({ ...prev, [key]: value }));
            }

            toast({
                title: "Settings updated",
                description: "Your preferences have been saved.",
            });
        } catch (error) {
            console.error('Settings update error:', error);
            if (key === "emailNotifications") {
                setSettings((prev) => ({ ...prev, emailNotifications: !(value as boolean) }));
            }

            toast({
                title: "Error",
                description: "Failed to update settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSettingsLoading(false);
        }
    };

    async function onSubmit(data: AccountFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to update profile");
            }

            await updateSession({
                user: responseData,
            });

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error: unknown) {
            console.error("Profile update error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const userImage = session?.user?.image;
    const isGoogleAuth = session?.user?.image?.includes('googleusercontent.com');

    const getInitials = (name: string) => {
        return name?.split(' ')[0]?.[0]?.toUpperCase() || '?';
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="container max-w-3xl py-10">
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            {isGoogleAuth && userImage ? (
                                <Image
                                    src={userImage}
                                    alt="Profile picture"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground">
                                    {getInitials(session?.user?.name || '')}
                                </div>
                            )}
                        </div>
                        <div>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>
                                Update your account information
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Your email"
                                                {...field}
                                                disabled={isGoogleAuth}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {isGoogleAuth
                                                ? "Email cannot be changed when using Google authentication."
                                                : "Your email address."
                                            }
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update profile"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Choose how you want to be notified about updates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive email updates about your account activity
                            </p>
                        </div>
                        {isSettingsLoading ? (
                            <Skeleton className="h-5 w-10 rounded-full" />
                        ) : (
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) =>
                                    handleSettingChange("emailNotifications", checked)
                                }
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize how the application looks
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select
                            value={theme}
                            onValueChange={(value) => handleSettingChange("theme", value)}
                            disabled={isSettingsLoading}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 