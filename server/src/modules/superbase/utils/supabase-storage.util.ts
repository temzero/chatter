import { ErrorResponse } from 'src/common/api-response/errors';
import { BadRequestError } from 'src/shared/types/enums/error-message.enum';

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
      ErrorResponse.badRequest(BadRequestError.INVALID_STORAGE_URL);
    }

    // Get everything after '/storage/v1/object/public/'
    const fullPath = pathParts[1];

    // Split into bucket and remaining path
    const firstSlash = fullPath.indexOf('/');
    if (firstSlash === -1) {
      ErrorResponse.badRequest(BadRequestError.INVALID_STORAGE_URL);
    }

    const bucket = fullPath.substring(0, firstSlash);
    const filePath = fullPath.substring(firstSlash + 1);

    if (!bucket || !filePath) {
      ErrorResponse.badRequest(BadRequestError.INVALID_STORAGE_URL);
    }

    return { bucket, filePath };
  } catch (error) {
    ErrorResponse.throw(error, `Failed to parse storage URL`);
  }
}
