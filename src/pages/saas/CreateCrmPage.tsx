/**
 * Create CRM Wizard Page
 * 
 * Multi-step wizard for creating a new CRM.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, ArrowRight, Check, Loader2, ShoppingCart, Briefcase, Heart, Book, Home, Settings } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { CrmWizardData, CrmCreationResult } from '@shared/saas-types';

const BUSINESS_TYPES = [
    { id: 'retail', name: 'Retail / E-commerce', description: 'Sell products to customers', icon: ShoppingCart },
    { id: 'services', name: 'Services / Agency', description: 'Provide services to clients', icon: Briefcase },
    { id: 'clinic', name: 'Clinic / Healthcare', description: 'Medical practice management', icon: Heart },
    { id: 'education', name: 'Education / Training', description: 'Manage students and courses', icon: Book },
    { id: 'realestate', name: 'Real Estate', description: 'Property and client management', icon: Home },
    { id: 'custom', name: 'Custom / Other', description: 'Build your own CRM', icon: Settings },
];

const COLOR_OPTIONS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#06b6d4', // Cyan
];

type WizardStep = 'type' | 'details' | 'creating' | 'done';

export default function CreateCrmPage() {
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();

    const [step, setStep] = useState<WizardStep>('type');
    const [wizardData, setWizardData] = useState<CrmWizardData>({
        businessType: '',
        businessName: '',
        needs: [],
        branding: {
            name: '',
            primaryColor: '#6366f1',
        },
    });
    const [createdApp, setCreatedApp] = useState<CrmCreationResult | null>(null);

    const handleTypeSelect = (typeId: string) => {
        setWizardData(prev => ({ ...prev, businessType: typeId }));
        setStep('details');
    };

    const handleCreateCrm = async () => {
        if (!wizardData.branding.name) {
            toast.error('Please enter a name for your CRM');
            return;
        }

        setStep('creating');

        try {
            const result = await api<CrmCreationResult>(`/api/saas/tenants/${tenantId}/apps`, {
                method: 'POST',
                body: JSON.stringify(wizardData),
            });

            setCreatedApp(result);
            setStep('done');
            toast.success('CRM created successfully!');
        } catch (error) {
            console.error('Failed to create CRM:', error);
            toast.error('Failed to create CRM. Please try again.');
            setStep('details');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'type' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                        {step !== 'type' ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <div className={`h-1 w-16 ${step !== 'type' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'details' ? 'bg-primary text-white' : step === 'creating' || step === 'done' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {step === 'done' || step === 'creating' ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <div className={`h-1 w-16 ${step === 'done' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'done' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {step === 'done' ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                </div>
            </div>

            {/* Step 1: Select Business Type */}
            {step === 'type' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">What type of business is this for?</h1>
                        <p className="text-muted-foreground mt-2">
                            We'll customize your CRM based on your industry
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {BUSINESS_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <Card
                                    key={type.id}
                                    className={`cursor-pointer transition-all hover:border-primary ${wizardData.businessType === type.id ? 'border-primary ring-2 ring-primary/20' : ''
                                        }`}
                                    onClick={() => handleTypeSelect(type.id)}
                                >
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{type.name}</h3>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="flex justify-start">
                        <Button variant="ghost" onClick={() => navigate(`/saas/${tenantId}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: CRM Details */}
            {step === 'details' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Name your CRM</h1>
                        <p className="text-muted-foreground mt-2">
                            Give your CRM a name and pick a theme color
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>CRM Details</CardTitle>
                            <CardDescription>
                                These can be changed later in settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="crmName">CRM Name</Label>
                                <Input
                                    id="crmName"
                                    placeholder="e.g., My Retail Store, Acme Clinic"
                                    value={wizardData.branding.name}
                                    onChange={(e) => setWizardData(prev => ({
                                        ...prev,
                                        branding: { ...prev.branding, name: e.target.value }
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name (optional)</Label>
                                <Input
                                    id="businessName"
                                    placeholder="Your company name"
                                    value={wizardData.businessName}
                                    onChange={(e) => setWizardData(prev => ({
                                        ...prev,
                                        businessName: e.target.value
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Theme Color</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            key={color}
                                            className={`h-10 w-10 rounded-full transition-all ${wizardData.branding.primaryColor === color
                                                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                                    : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setWizardData(prev => ({
                                                ...prev,
                                                branding: { ...prev.branding, primaryColor: color }
                                            }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep('type')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                            onClick={handleCreateCrm}
                            disabled={!wizardData.branding.name}
                            className="bg-gradient-brand text-white"
                        >
                            Create CRM <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Creating */}
            {step === 'creating' && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Creating your CRM...</h2>
                    <p className="text-muted-foreground">
                        Setting up modules, fields, and views
                    </p>
                </div>
            )}

            {/* Step 4: Done */}
            {step === 'done' && createdApp && (
                <div className="text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">Your CRM is Ready!</h1>
                        <p className="text-muted-foreground mt-2">
                            {createdApp.app.name} has been created with {createdApp.modules.length} modules
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 justify-center">
                                <div
                                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: createdApp.app.branding.primaryColor }}
                                >
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-lg">{createdApp.app.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {createdApp.modules.length} modules ready to use
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                {createdApp.modules.map((module) => (
                                    <span
                                        key={module.id}
                                        className="text-sm bg-muted px-3 py-1 rounded-full"
                                    >
                                        {module.displayName}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate(`/saas/${tenantId}`)}>
                            Back to Dashboard
                        </Button>
                        <Button
                            onClick={() => navigate(`/app/${createdApp.app.id}`)}
                            className="bg-gradient-brand text-white"
                        >
                            Open CRM <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
