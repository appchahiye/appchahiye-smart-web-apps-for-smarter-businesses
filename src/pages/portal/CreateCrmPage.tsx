import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import {
    ArrowLeft, ArrowRight, Check, Briefcase, ShoppingCart, Heart,
    GraduationCap, Home, Coffee, Settings, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessType, Tenant, CrmWizardData } from '@shared/saas-types';

interface BusinessPreset {
    id: BusinessType;
    name: string;
    description: string;
    icon: string;
}

const STEP_TITLES = ['Choose Business Type', 'Name Your CRM', 'Pick Theme', 'Review & Create'];

const PRESET_ICONS: Record<string, React.ReactNode> = {
    'shopping-cart': <ShoppingCart className="h-8 w-8" />,
    'briefcase': <Briefcase className="h-8 w-8" />,
    'heart': <Heart className="h-8 w-8" />,
    'book': <GraduationCap className="h-8 w-8" />,
    'home': <Home className="h-8 w-8" />,
    'coffee': <Coffee className="h-8 w-8" />,
    'settings': <Settings className="h-8 w-8" />,
};

const THEME_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#3b82f6' },
];

export default function CreateCrmPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [presets, setPresets] = useState<BusinessPreset[]>([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    // Wizard data
    const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
    const [crmName, setCrmName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#6366f1');

    // Load presets and tenant
    useEffect(() => {
        if (clientId) {
            setIsLoadingPresets(true);
            Promise.all([
                api<{ presets: BusinessPreset[] }>('/api/saas/presets'),
                api<{ tenant: Tenant }>(`/api/saas/my-tenant?userId=${clientId}`),
            ])
                .then(([presetsData, tenantData]) => {
                    setPresets(presetsData.presets);
                    setTenantId(tenantData.tenant.id);
                })
                .catch(err => console.error('Failed to load data:', err))
                .finally(() => setIsLoadingPresets(false));
        }
    }, [clientId]);

    const canProceed = () => {
        switch (step) {
            case 0: return selectedType !== null;
            case 1: return crmName.trim().length > 0;
            case 2: return primaryColor !== '';
            case 3: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < 3 && canProceed()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleCreate = async () => {
        if (!tenantId || !selectedType || !crmName) return;

        setIsCreating(true);
        try {
            const wizardData: CrmWizardData = {
                businessType: selectedType,
                name: crmName,
                businessName: businessName || crmName,
                primaryColor,
            };

            const result = await api<{ app: { id: string }, modules: unknown[] }>(
                `/api/saas/tenants/${tenantId}/apps`,
                { method: 'POST', body: JSON.stringify(wizardData) }
            );

            // Redirect to My CRMs page with success
            navigate(`/portal/${clientId}/my-crms?created=${result.app.id}`);
        } catch (err) {
            console.error('Failed to create CRM:', err);
            alert('Failed to create CRM. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const getSelectedPreset = () => presets.find(p => p.id === selectedType);

    return (
        <ClientPortalLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New CRM</h1>
                    <p className="text-muted-foreground">
                        Build a custom CRM tailored to your business in minutes
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                    {STEP_TITLES.map((title, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                    i < step ? "bg-primary text-primary-foreground" :
                                        i === step ? "bg-primary text-primary-foreground" :
                                            "bg-muted text-muted-foreground"
                                )}
                            >
                                {i < step ? <Check className="h-4 w-4" /> : i + 1}
                            </div>
                            <span className={cn(
                                "text-sm hidden sm:inline",
                                i <= step ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {title}
                            </span>
                            {i < 3 && <div className="flex-1 h-1 bg-muted rounded" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>{STEP_TITLES[step]}</CardTitle>
                        <CardDescription>
                            {step === 0 && "Select the type of business your CRM will manage"}
                            {step === 1 && "Give your CRM a name that represents your business"}
                            {step === 2 && "Choose a color theme for your CRM interface"}
                            {step === 3 && "Review your choices and create your CRM"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Step 0: Business Type */}
                        {step === 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {isLoadingPresets ? (
                                    [...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-32" />
                                    ))
                                ) : (
                                    presets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setSelectedType(preset.id)}
                                            className={cn(
                                                "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                                                selectedType === preset.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <div className="text-primary mb-2">
                                                {PRESET_ICONS[preset.icon] || <Briefcase className="h-8 w-8" />}
                                            </div>
                                            <div className="font-medium">{preset.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {preset.description}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Step 1: Name */}
                        {step === 1 && (
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="crmName">CRM Name *</Label>
                                    <Input
                                        id="crmName"
                                        placeholder="e.g., My Clinic CRM"
                                        value={crmName}
                                        onChange={e => setCrmName(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This will be the name of your CRM application
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name (optional)</Label>
                                    <Input
                                        id="businessName"
                                        placeholder="e.g., City Health Clinic"
                                        value={businessName}
                                        onChange={e => setBusinessName(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Your company or organization name
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Theme */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <Label>Select Primary Color</Label>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {THEME_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => setPrimaryColor(color.value)}
                                            className={cn(
                                                "w-12 h-12 rounded-lg transition-all",
                                                primaryColor === color.value
                                                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                                                    : "hover:scale-105"
                                            )}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: primaryColor }}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {crmName.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{crmName || 'Your CRM'}</div>
                                            <div className="text-sm text-muted-foreground">Preview</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted">
                                        <div className="text-sm text-muted-foreground">Business Type</div>
                                        <div className="font-medium">{getSelectedPreset()?.name}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted">
                                        <div className="text-sm text-muted-foreground">CRM Name</div>
                                        <div className="font-medium">{crmName}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted">
                                        <div className="text-sm text-muted-foreground">Business Name</div>
                                        <div className="font-medium">{businessName || crmName}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted">
                                        <div className="text-sm text-muted-foreground">Theme Color</div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded"
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                            <span className="font-medium">{primaryColor}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg border border-dashed">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        Your CRM will include:
                                    </div>
                                    <div className="text-sm">
                                        • Pre-configured modules based on {getSelectedPreset()?.name} template<br />
                                        • Ready-to-use fields for each module<br />
                                        • Table and Kanban views<br />
                                        • Multi-user support with roles
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 0}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    {step < 3 ? (
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleCreate} disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Create CRM
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </ClientPortalLayout>
    );
}
