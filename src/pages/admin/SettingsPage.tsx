import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from '@/lib/api-client';
import type { WebsiteContent } from '@shared/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
const settingsSchema = z.object({
  brandAssets: z.object({
    logoUrl: z.string().min(1, 'Logo is required'),
    faviconUrl: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  }),
  seoMetadata: z.object({
    siteTitle: z.string().min(1, 'Site title is required'),
    metaDescription: z.string().min(1, 'Meta description is required'),
  }),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;
export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullContent, setFullContent] = useState<WebsiteContent | null>(null);
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });
  useEffect(() => {
    api<WebsiteContent>('/api/content')
      .then(data => {
        setFullContent(data);
        reset({
          brandAssets: data.brandAssets,
          seoMetadata: data.seoMetadata,
        });
        setIsLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load settings.');
        setIsLoading(false);
      });
  }, [reset]);
  const onSubmit = async (data: SettingsFormValues) => {
    if (!fullContent) {
      toast.error('Cannot save, original content not loaded.');
      return;
    }
    setIsSaving(true);
    const updatedContent: WebsiteContent = {
      ...fullContent,
      brandAssets: data.brandAssets,
      seoMetadata: data.seoMetadata,
    };
    try {
      await api('/api/content', {
        method: 'PUT',
        body: JSON.stringify(updatedContent),
      });
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <Toaster richColors />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
              <CardDescription>Manage your company's logo and brand colors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <Controller
                    name="brandAssets.logoUrl"
                    control={control}
                    render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} />}
                  />
                  {errors.brandAssets?.logoUrl && <p className="text-sm text-red-500 mt-1">{errors.brandAssets.logoUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                   <Controller
                    name="brandAssets.faviconUrl"
                    control={control}
                    render={({ field }) => <FileUpload value={field.value || ''} onChange={field.onChange} />}
                  />
                  {errors.brandAssets?.faviconUrl && <p className="text-sm text-red-500 mt-1">{errors.brandAssets.faviconUrl.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" {...register('brandAssets.primaryColor')} />
                  {errors.brandAssets?.primaryColor && <p className="text-sm text-red-500 mt-1">{errors.brandAssets.primaryColor.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input id="secondaryColor" {...register('brandAssets.secondaryColor')} />
                  {errors.brandAssets?.secondaryColor && <p className="text-sm text-red-500 mt-1">{errors.brandAssets.secondaryColor.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>SEO Metadata</CardTitle>
              <CardDescription>Configure search engine optimization settings for the marketing site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input id="siteTitle" placeholder="AppChahiye: Smart Web Apps" {...register('seoMetadata.siteTitle')} />
                {errors.seoMetadata?.siteTitle && <p className="text-sm text-red-500 mt-1">{errors.seoMetadata.siteTitle.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input id="metaDescription" placeholder="We build custom web apps..." {...register('seoMetadata.metaDescription')} />
                {errors.seoMetadata?.metaDescription && <p className="text-sm text-red-500 mt-1">{errors.seoMetadata.metaDescription.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AdminLayout>
  );
}