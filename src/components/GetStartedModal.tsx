import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ClientRegistrationResponse } from '@shared/types';
import { Loader2, CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name is required'),
  projectType: z.string().min(3, 'Please describe your project briefly'),
});
type RegistrationFormValues = z.infer<typeof registrationSchema>;
type ModalStep = 'form' | 'loading' | 'success';
interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [registrationData, setRegistrationData] = useState<ClientRegistrationResponse | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });
  const handleClose = () => {
    onClose();
    // Reset modal to initial state after a short delay to allow animation
    setTimeout(() => {
      setStep('form');
      setRegistrationData(null);
      reset();
    }, 300);
  };
  const onSubmit = async (data: RegistrationFormValues) => {
    setStep('loading');
    try {
      const response = await api<ClientRegistrationResponse>('/api/clients/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setRegistrationData(response);
      setStep('success');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      setStep('form');
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Password copied to clipboard!');
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Toaster richColors />
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Start Your Project</DialogTitle>
              <DialogDescription>Tell us a bit about your business to get started.</DialogDescription>
            </DialogHeader>
            {/* Google Sign-In Button */}
            <div className="py-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" {...register('company')} />
                {errors.company && <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>}
              </div>
              <div>
                <Label htmlFor="projectType">What are you looking to build?</Label>
                <Input id="projectType" placeholder="e.g., Custom CRM, Inventory Manager" {...register('projectType')} />
                {errors.projectType && <p className="text-sm text-red-500 mt-1">{errors.projectType.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white hover:opacity-90 transition-opacity">
                Create My Portal
              </Button>
            </form>
          </>
        )}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-deep-violet" />
            <p className="text-lg font-medium">Creating your secure portal...</p>
          </div>
        )}
        {step === 'success' && registrationData && (
          <div className="py-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl">Your Client Dashboard is Ready!</DialogTitle>
            <DialogDescription className="mt-2 mb-6">
              Use these credentials to log in. Please save your password securely.
            </DialogDescription>
            <div className="space-y-4 text-left bg-muted p-4 rounded-lg">
              <div>
                <Label>Login Email</Label>
                <p className="font-mono text-sm">{registrationData.user.email}</p>
              </div>
              <div>
                <Label>Your Password</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={registrationData.password_plaintext} className="font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(registrationData.password_plaintext)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(registrationData.client.portalUrl.replace(/:clientId/, registrationData.client.id))}
              className="w-full mt-6 bg-gradient-brand text-white hover:opacity-90 transition-opacity"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}