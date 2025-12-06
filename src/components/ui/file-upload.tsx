import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  folder?: 'avatars' | 'milestones' | 'invoices' | 'content' | 'attachments';
  entityId?: string;
  variant?: 'default' | 'avatar' | 'small';
  accept?: Record<string, string[]>;
}

const sizeClasses = {
  default: 'w-full h-48',
  avatar: 'w-24 h-24 rounded-full',
  small: 'w-full h-32',
};

export function FileUpload({
  value,
  onChange,
  className,
  folder = 'content',
  entityId,
  variant = 'default',
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (entityId) {
        formData.append('entityId', entityId);
      }
      try {
        const response = await api<{ url: string }>('/api/upload', {
          method: 'POST',
          body: formData,
        });
        onChange(response.url);
        toast.success('File uploaded successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'File upload failed. Please try again.';
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onChange, folder, entityId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const sizeClass = sizeClasses[variant];
  const isAvatar = variant === 'avatar';

  if (value) {
    return (
      <div className={cn("relative overflow-hidden group", sizeClass, isAvatar ? 'rounded-full' : 'rounded-md', className)}>
        <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className={cn(
            "absolute h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
            isAvatar ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "top-2 right-2"
          )}
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
        sizeClass,
        isAvatar ? 'rounded-full' : 'rounded-md',
        className
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <>
          <Loader2 className={cn("animate-spin text-primary", isAvatar ? "h-6 w-6" : "h-8 w-8")} />
          {!isAvatar && <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>}
        </>
      ) : (
        <>
          <UploadCloud className={cn("text-muted-foreground", isAvatar ? "h-6 w-6" : "h-8 w-8")} />
          {!isAvatar && (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive ? "Drop the file here" : "Drag & drop a file, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </>
      )}
    </div>
  );
}