import { ErrorResponse } from 'src/common/api-response/errors';

// src/utils/supabase-storage.util.ts
export interface ParsedStorageUrl {
  bucket: string;
  filePath: string;
}

export function parseSupabaseStorageUrl(url: string): ParsedStorageUrl {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/');

    if (pathParts.length !== 2) {
      ErrorResponse.unauthorized(`Invalid Supabase storage URL format`);
    }

    // Get everything after '/storage/v1/object/public/'
    const fullPath = pathParts[1];

    // Split into bucket and remaining path
    const firstSlash = fullPath.indexOf('/');
    if (firstSlash === -1) {
      ErrorResponse.unauthorized(`URL missing file path after bucket`);
    }

    const bucket = fullPath.substring(0, firstSlash);
    const filePath = fullPath.substring(firstSlash + 1);

    if (!bucket || !filePath) {
      ErrorResponse.unauthorized(
        `Could not extract bucket or file path from URL`,
      );
    }

    return { bucket, filePath };
  } catch (error) {
    ErrorResponse.throw(error, `Failed to parse storage URL`);
  }
}
