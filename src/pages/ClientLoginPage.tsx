import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function ClientLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl"></div>
        <Card className="w-full max-w-sm z-10 animate-scale-in">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Client Portal Login</CardTitle>
                <CardDescription>Enter your credentials to access your project dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="client@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-brand text-white hover:opacity-90 transition-opacity">
                        Login to Your Portal
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}