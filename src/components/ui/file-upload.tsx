import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}
export function FileUpload({ value, onChange, className }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        // In a real app, you'd upload the file and get a URL back.
        // Here, we'll just use a placeholder.
        const randomImageId = Math.floor(Math.random() * 1000);
        const mockUrl = `https://i.pravatar.cc/300?u=${randomImageId}`;
        onChange(mockUrl);
        setIsUploading(false);
      }, 1500);
    }
  }, [onChange]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };
  if (value) {
    return (
      <div className={cn("relative w-full h-48 rounded-md overflow-hidden group", className)}>
        <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
        "w-full h-48 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? "Drop the file here" : "Drag & drop a file here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF up to 10MB</p>
        </>
      )}
    </div>
  );
}