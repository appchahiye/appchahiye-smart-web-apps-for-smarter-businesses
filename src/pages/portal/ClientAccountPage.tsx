import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClientPortalLayout } from "@/components/layout/ClientPortalLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { ClientProfile } from "@shared/types";
import { Toaster, toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  avatarUrl: z.string().optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
export default function ClientAccountPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ClientProfile | null>(null);
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });
  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      api<ClientProfile>(`/api/portal/${clientId}/account`)
        .then(data => {
          setProfileData(data);
          profileForm.reset({ name: data.name, company: data.company, avatarUrl: data.avatarUrl });
          setIsLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load account details.");
          setIsLoading(false);
        });
    }
  }, [clientId, profileForm]);
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await api(`/api/portal/${clientId}/account`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      toast.success("Profile updated successfully!");
      // Optionally refetch data to update avatar preview instantly
      setProfileData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    }
  };
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await api(`/api/portal/${clientId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      toast.success("Password changed successfully!");
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password.");
    }
  };
  return (
    <ClientPortalLayout>
      <Toaster richColors />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal and company details.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <Controller
                      name="avatarUrl"
                      control={profileForm.control}
                      render={({ field }) => <FileUpload value={field.value || ''} onChange={field.onChange} className="w-32 h-32 rounded-full" />}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...profileForm.register('name')} />
                        {profileForm.formState.errors.name && <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue={profileData?.email || ''} disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" {...profileForm.register('company')} />
                      {profileForm.formState.errors.company && <p className="text-sm text-red-500">{profileForm.formState.errors.company.message}</p>}
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password for security.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" {...passwordForm.register('currentPassword')} />
                {passwordForm.formState.errors.currentPassword && <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" {...passwordForm.register('newPassword')} />
                {passwordForm.formState.errors.newPassword && <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" {...passwordForm.register('confirmPassword')} />
                {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Project Updates</p>
                <p className="text-sm text-muted-foreground">Receive an email when a milestone is updated.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">New Messages</p>
                <p className="text-sm text-muted-foreground">Get notified about new messages in the chat.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}