import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api-client';
import type { LoginResponse } from '@shared/types';
import { Loader2 } from 'lucide-react';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'appchahiye@gmail.com',
      password: 'Eiahta@840',
    }
  });
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api<LoginResponse>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      login(response.user, response.token);
      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/admin'), 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      <Toaster richColors />
      <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl"></div>
      <Card className="w-full max-w-sm z-10 animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@appchahiye.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-brand text-white hover:opacity-90 transition-opacity" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}