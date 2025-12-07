import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from '@/lib/api-client';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import type { CrmApp } from '@shared/saas-types';

interface LoginMode {
    type: 'login' | 'setup';
}

export default function CrmLoginPage() {
    const { appId } = useParams<{ appId: string }>();
    const navigate = useNavigate();

    const [mode, setMode] = useState<LoginMode>({ type: 'login' });
    const [app, setApp] = useState<CrmApp | null>(null);
    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Load app info to check if setup is needed
    useEffect(() => {
        if (appId) {
            setIsLoadingApp(true);
            api<{ app: CrmApp; modules: unknown[] }>(`/api/saas/apps/${appId}`)
                .then(data => {
                    setApp(data.app);
                    // Check if CRM has users (if not, show setup mode)
                    return api<{ users: unknown[] }>(`/api/crm/${appId}/users`);
                })
                .then(usersData => {
                    if (usersData.users.length === 0) {
                        setMode({ type: 'setup' });
                    }
                })
                .catch(err => {
                    console.error('Failed to load app:', err);
                    setError('Failed to load CRM');
                })
                .finally(() => setIsLoadingApp(false));
        }
    }, [appId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await api<{ user: unknown; token: string }>(`/api/crm/${appId}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Store token
            localStorage.setItem(`crm_token_${appId}`, result.token);

            // Navigate to CRM dashboard
            navigate(`/app/${appId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await api<{ user: unknown; token: string }>(`/api/crm/${appId}/auth/setup`, {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });

            // Store token
            localStorage.setItem(`crm_token_${appId}`, result.token);

            // Navigate to CRM dashboard
            navigate(`/app/${appId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Setup failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const primaryColor = app?.branding?.primaryColor || '#6366f1';

    if (isLoadingApp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {app?.name?.charAt(0) || 'C'}
                        </div>
                    </div>
                    <CardTitle className="text-2xl">
                        {mode.type === 'setup' ? 'Set Up Your CRM' : `Sign in to ${app?.name}`}
                    </CardTitle>
                    <CardDescription>
                        {mode.type === 'setup'
                            ? 'Create your owner account to get started'
                            : 'Enter your credentials to access the CRM'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={mode.type === 'setup' ? handleSetup : handleLogin} className="space-y-4">
                        {mode.type === 'setup' && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                    minLength={6}
                                />
                            </div>
                            {mode.type === 'setup' && (
                                <p className="text-xs text-muted-foreground">
                                    Minimum 6 characters
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            style={{ backgroundColor: primaryColor }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {mode.type === 'setup' ? 'Setting up...' : 'Signing in...'}
                                </>
                            ) : (
                                mode.type === 'setup' ? 'Create Account & Start' : 'Sign In'
                            )}
                        </Button>
                    </form>

                    {mode.type === 'login' && (
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Contact your team admin if you need access
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
