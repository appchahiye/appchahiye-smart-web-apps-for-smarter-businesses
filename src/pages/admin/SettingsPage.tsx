import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>Manage your company's logo and brand colors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" placeholder="https://example.com/logo.png" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input id="primary-color" value="#2F80ED" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <Input id="secondary-color" value="#5B2EFF" disabled />
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
              <Label htmlFor="seo-title">Site Title</Label>
              <Input id="seo-title" placeholder="AppChahiye: Smart Web Apps" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description">Meta Description</Label>
              <Input id="seo-description" placeholder="We build custom web apps..." disabled />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button disabled>Save Changes</Button>
        </div>
      </div>
    </AdminLayout>
  );
}