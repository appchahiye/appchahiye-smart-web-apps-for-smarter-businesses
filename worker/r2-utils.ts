/**
 * R2 Storage Utilities for AppChahiye
 * Provides helpers for file upload, download, and management
 */

import type { Env } from './core-utils';

// File metadata stored in object's custom metadata
interface FileMetadata {
    originalName: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    uploadedBy?: string;
}

/**
 * Generate a unique file key with proper folder structure
 */
export function generateFileKey(
    folder: 'avatars' | 'milestones' | 'invoices' | 'content' | 'attachments',
    id: string,
    filename: string
): string {
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    switch (folder) {
        case 'avatars':
            return `avatars/${id}.${ext}`;
        case 'invoices':
            return `invoices/${id}.pdf`;
        case 'milestones':
            return `milestones/${id}/${timestamp}_${safeFilename}`;
        case 'content':
            return `content/${timestamp}_${safeFilename}`;
        case 'attachments':
            return `attachments/${id}/${timestamp}_${safeFilename}`;
        default:
            return `uploads/${timestamp}_${safeFilename}`;
    }
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
    env: Env,
    key: string,
    file: ArrayBuffer | ReadableStream,
    contentType: string,
    metadata?: Partial<FileMetadata>
): Promise<{ key: string; url: string }> {
    const fullMetadata: FileMetadata = {
        originalName: metadata?.originalName || key.split('/').pop() || 'file',
        contentType,
        size: metadata?.size || 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: metadata?.uploadedBy,
    };

    // Convert metadata to string values for R2 custom metadata
    const stringMetadata: Record<string, string> = {
        originalName: fullMetadata.originalName,
        contentType: fullMetadata.contentType,
        size: String(fullMetadata.size),
        uploadedAt: fullMetadata.uploadedAt,
        ...(fullMetadata.uploadedBy && { uploadedBy: fullMetadata.uploadedBy }),
    };

    await env.FILES.put(key, file, {
        httpMetadata: {
            contentType,
        },
        customMetadata: stringMetadata,
    });

    return {
        key,
        url: `/api/files/${key}`,
    };
}

/**
 * Get a file from R2
 */
export async function getFile(
    env: Env,
    key: string
): Promise<{ object: R2ObjectBody; metadata: FileMetadata } | null> {
    const object = await env.FILES.get(key);

    if (!object) {
        return null;
    }

    const metadata: FileMetadata = {
        originalName: object.customMetadata?.originalName || key.split('/').pop() || 'file',
        contentType: object.httpMetadata?.contentType || 'application/octet-stream',
        size: object.size,
        uploadedAt: object.customMetadata?.uploadedAt || object.uploaded.toISOString(),
        uploadedBy: object.customMetadata?.uploadedBy,
    };

    return { object, metadata };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(env: Env, key: string): Promise<boolean> {
    try {
        await env.FILES.delete(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * List files in a folder
 */
export async function listFiles(
    env: Env,
    prefix: string,
    limit = 100
): Promise<{ keys: string[]; truncated: boolean }> {
    const listed = await env.FILES.list({ prefix, limit });

    return {
        keys: listed.objects.map((obj: { key: string }) => obj.key),
        truncated: listed.truncated,
    };
}

/**
 * Check if a file exists
 */
export async function fileExists(env: Env, key: string): Promise<boolean> {
    const head = await env.FILES.head(key);
    return head !== null;
}

/**
 * Get file content type from extension
 */
export function getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',

        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        // Text
        'txt': 'text/plain',
        'csv': 'text/csv',
        'json': 'application/json',
        'xml': 'application/xml',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',

        // Archives
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'tar': 'application/x-tar',
        'gz': 'application/gzip',

        // Media
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Type for R2ObjectBody (runtime type from Cloudflare Workers)
type R2ObjectBody = {
    body: ReadableStream;
    customMetadata?: Record<string, string>;
    httpMetadata?: { contentType?: string };
    size: number;
    uploaded: Date;
};
