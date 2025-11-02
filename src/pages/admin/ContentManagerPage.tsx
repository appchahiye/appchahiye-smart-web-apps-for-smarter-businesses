import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { WebsiteContent } from '@shared/types';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
const heroSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().min(1, 'Subheadline is required'),
  imageUrl: z.string().min(1, 'Image is required'),
});
const stepSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});
const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});
const portfolioItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().min(1, 'Image is required'),
});
const pricingTierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Price is required'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')),
  popular: z.boolean(),
});
const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  text: z.string().min(1, 'Text is required'),
  avatar: z.string().min(1, 'Avatar is required'),
});
const ctaSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().min(1, 'Subheadline is required'),
});
const brandAssetsSchema = z.object({
  logoUrl: z.string(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
});
const seoMetadataSchema = z.object({
  siteTitle: z.string(),
  metaDescription: z.string(),
});
const contentSchema = z.object({
  hero: heroSchema,
  howItWorks: z.array(stepSchema),
  whyChooseUs: z.array(featureSchema),
  portfolio: z.array(portfolioItemSchema),
  pricing: z.array(pricingTierSchema),
  testimonials: z.array(testimonialSchema),
  finalCta: ctaSchema,
  brandAssets: brandAssetsSchema,
  seoMetadata: seoMetadataSchema,
});
export default function ContentManagerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<WebsiteContent>({
    resolver: zodResolver(contentSchema),
  });
  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({ control, name: "portfolio" });
  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({ control, name: "pricing" });
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({ control, name: "testimonials" });
  useEffect(() => {
    api<WebsiteContent>('/api/content')
      .then(data => {
        reset(data);
        setIsLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load content.');
        setIsLoading(false);
      });
  }, [reset]);
  const onSubmit = async (data: WebsiteContent) => {
    setIsSaving(true);
    try {
      await api('/api/content', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      toast.success('Content updated successfully!');
    } catch (error) {
      toast.error('Failed to save content.');
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
          <h1 className="text-2xl font-bold">Website Content Manager</h1>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
        <Tabs defaultValue="hero">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 mb-4">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="howItWorks">How It Works</TabsTrigger>
            <TabsTrigger value="whyChooseUs">Features</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="cta">Final CTA</TabsTrigger>
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="hero">
            <Card>
              <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input {...register('hero.headline')} />
                  {errors.hero?.headline && <p className="text-red-500 text-sm mt-1">{errors.hero.headline.message}</p>}
                </div>
                <div>
                  <Label>Subheadline</Label>
                  <Textarea {...register('hero.subheadline')} />
                  {errors.hero?.subheadline && <p className="text-red-500 text-sm mt-1">{errors.hero.subheadline.message}</p>}
                </div>
                <div>
                  <Label>Image</Label>
                  <Controller
                    name="hero.imageUrl"
                    control={control}
                    render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} />}
                  />
                  {errors.hero?.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.hero.imageUrl.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="portfolio">
            <Card>
              <CardHeader><CardTitle>Portfolio Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {portfolioFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start border p-4 rounded-md">
                    <div className="flex-grow space-y-2">
                      <div>
                        <Label>Project Name</Label>
                        <Input {...register(`portfolio.${index}.name`)} />
                      </div>
                      <div>
                        <Label>Image</Label>
                        <Controller
                          name={`portfolio.${index}.image`}
                          control={control}
                          render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} />}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removePortfolio(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendPortfolio({ name: '', image: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="testimonials">
            <Card>
              <CardHeader><CardTitle>Testimonials Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {testimonialFields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-md space-y-2">
                     <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Testimonial {index + 1}</h3>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeTestimonial(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div><Label>Name</Label><Input {...register(`testimonials.${index}.name`)} /></div>
                    <div><Label>Company</Label><Input {...register(`testimonials.${index}.company`)} /></div>
                    <div><Label>Text</Label><Textarea {...register(`testimonials.${index}.text`)} /></div>
                    <div>
                      <Label>Avatar</Label>
                      <Controller
                        name={`testimonials.${index}.avatar`}
                        control={control}
                        render={({ field }) => <FileUpload value={field.value} onChange={field.onChange} className="h-24 w-24 rounded-full" />}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendTestimonial({ name: '', company: '', text: '', avatar: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Other tabs remain unchanged */}
          <TabsContent value="howItWorks">
            <Card>
              <CardHeader><CardTitle>How It Works Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[0, 1, 2].map(index => (
                  <div key={index} className="border p-4 rounded-md space-y-2">
                    <h3 className="font-semibold">Step {index + 1}</h3>
                    <div>
                      <Label>Title</Label>
                      <Input {...register(`howItWorks.${index}.title`)} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input {...register(`howItWorks.${index}.description`)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="whyChooseUs">
            <Card>
              <CardHeader><CardTitle>Why Choose Us Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[0, 1, 2, 3].map(index => (
                  <div key={index} className="border p-4 rounded-md space-y-2">
                    <h3 className="font-semibold">Feature {index + 1}</h3>
                    <div>
                      <Label>Title</Label>
                      <Input {...register(`whyChooseUs.${index}.title`)} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input {...register(`whyChooseUs.${index}.description`)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Pricing Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pricingFields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Tier {index + 1}</h3>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removePricing(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div><Label>Name</Label><Input {...register(`pricing.${index}.name`)} /></div>
                    <div><Label>Price</Label><Input {...register(`pricing.${index}.price`)} /></div>
                    <div><Label>Features (comma-separated)</Label>
                      <Controller
                        name={`pricing.${index}.features`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            value={Array.isArray(value) ? value.join(', ') : ''}
                            onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...register(`pricing.${index}.popular`)} />
                      <Label>Most Popular?</Label>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendPricing({ name: '', price: '', features: [], popular: false })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cta">
            <Card>
              <CardHeader><CardTitle>Final CTA Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input {...register('finalCta.headline')} />
                </div>
                <div>
                  <Label>Subheadline</Label>
                  <Textarea {...register('finalCta.subheadline')} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="brand">
            <Card>
              <CardHeader><CardTitle>Brand Assets</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo URL</Label>
                  <Input {...register('brandAssets.logoUrl')} />
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <Input {...register('brandAssets.primaryColor')} />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input {...register('brandAssets.secondaryColor')} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="seo">
            <Card>
              <CardHeader><CardTitle>SEO Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Site Title</Label>
                  <Input {...register('seoMetadata.siteTitle')} />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea {...register('seoMetadata.metaDescription')} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </AdminLayout>
  );
}