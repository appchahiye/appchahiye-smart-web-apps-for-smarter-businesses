import { useParams, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Bell, Shield, Database, Link2 } from 'lucide-react';
import type { CrmApp, Module } from '@shared/saas-types';

export default function CrmSettingsPage() {
    const { appId } = useParams<{ appId: string }>();
    const context = useOutletContext<{ app?: CrmApp; modules?: Module[] }>();
    const app = context?.app;
    const primaryColor = app?.branding?.primaryColor || '#6366f1';

    const settingSections = [
        {
            title: 'General',
            description: 'Basic CRM settings and configuration',
            icon: Settings,
            items: ['CRM Name', 'Description', 'Business Type'],
        },
        {
            title: 'Branding',
            description: 'Customize your CRM appearance',
            icon: Palette,
            items: ['Logo', 'Primary Color', 'Theme'],
        },
        {
            title: 'Notifications',
            description: 'Configure email and in-app notifications',
            icon: Bell,
            items: ['Email Alerts', 'Activity Notifications', 'Daily Digest'],
        },
        {
            title: 'Access & Security',
            description: 'Manage permissions and security settings',
            icon: Shield,
            items: ['Role Permissions', 'Two-Factor Auth', 'Session Timeout'],
        },
        {
            title: 'Data Management',
            description: 'Import, export, and manage your data',
            icon: Database,
            items: ['Import Data', 'Export Data', 'Backup Settings'],
        },
        {
            title: 'Integrations',
            description: 'Connect with other tools and services',
            icon: Link2,
            items: ['Email Integration', 'Calendar Sync', 'API Access'],
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your CRM configuration and preferences
                </p>
            </div>

            {/* Current CRM Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {app?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <CardTitle>{app?.name || 'CRM Settings'}</CardTitle>
                            <CardDescription>
                                {app?.description || 'Configure your CRM'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Settings Sections */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingSections.map(section => (
                    <Card key={section.title} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${primaryColor}20` }}
                                >
                                    <section.icon className="h-5 w-5" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{section.title}</CardTitle>
                                    <CardDescription className="text-xs">
                                        {section.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                                {section.items.map(item => (
                                    <li key={item}>• {item}</li>
                                ))}
                            </ul>
                            <Button variant="outline" size="sm" className="w-full" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions for this CRM
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button variant="outline" disabled>
                        Archive CRM
                    </Button>
                    <Button variant="destructive" disabled>
                        Delete CRM
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
