import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function ClientLoginPage() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        try {
            const response = await fetch('/api/clients/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed. Please check your credentials.');
            }

            toast.success('Login successful! Redirecting to your portal.');
            // The user.id from the response is the clientId for the portal URL
            if (result.data && result.data.user && result.data.user.id) {
                navigate(`/portal/${result.data.user.id}`);
            } else {
                throw new Error('Login response is missing user data.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl"></div>
            <Card className="w-full max-w-sm z-10 animate-scale-in">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Client Portal Login</CardTitle>
                    <CardDescription>Enter your credentials to access your project dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="client@example.com" {...register("email")} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register("password")} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-gradient-brand text-white hover:opacity-90 transition-opacity" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login to Your Portal'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}