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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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