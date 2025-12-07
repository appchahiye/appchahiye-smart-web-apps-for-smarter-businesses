import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, Zap, Crown } from 'lucide-react';

export default function BillingPage() {
    return (
        <ClientPortalLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
                    <p className="text-muted-foreground">
                        Manage your subscription and payment methods
                    </p>
                </div>

                {/* Coming Soon Card */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <CreditCard className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            We're working on bringing you flexible pricing plans and payment options.
                            Stay tuned for updates!
                        </p>

                        {/* Preview Plans */}
                        <div className="grid md:grid-cols-3 gap-4 w-full max-w-2xl opacity-60">
                            <Card>
                                <CardHeader className="text-center pb-2">
                                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <CardTitle className="text-lg">Free</CardTitle>
                                    <CardDescription>For trying out</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-2xl font-bold">$0</div>
                                    <div className="text-sm text-muted-foreground">/month</div>
                                </CardContent>
                            </Card>
                            <Card className="border-primary/50">
                                <CardHeader className="text-center pb-2">
                                    <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <CardTitle className="text-lg">Pro</CardTitle>
                                    <CardDescription>For growing teams</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-2xl font-bold">$29</div>
                                    <div className="text-sm text-muted-foreground">/month</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="text-center pb-2">
                                    <Crown className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                                    <CardTitle className="text-lg">Enterprise</CardTitle>
                                    <CardDescription>For large orgs</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-2xl font-bold">Custom</div>
                                    <div className="text-sm text-muted-foreground">Contact us</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Button className="mt-8" variant="outline" disabled>
                            Notify Me When Available
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </ClientPortalLayout>
    );
}
