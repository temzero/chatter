import SupabaseService, { avatarBucket } from "./supabaseService";

/**
 * Upload avatar directly to Supabase
 * @param file - File object to upload
 * @param oldUrl - Previous avatar URL to delete (optional)
 * @param folder - Folder inside avatars bucket ("user" | "group")
 * @returns Public URL of uploaded avatar
 */
export async function uploadAvatarToSupabase(
  file: File,
  oldUrl?: string,
  folder: "user" | "group" = "user"
): Promise<string> {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${fileExt}`;

  // Upload the new avatar using SupabaseService
  const publicUrl = await SupabaseService.uploadFile(
    file,
    avatarBucket,
    path,
    false
  );

  // Delete the old avatar if provided
  if (oldUrl) {
    await SupabaseService.deleteFiles([oldUrl], avatarBucket);
  }

  console.log(`[Supabase] Uploaded avatar (${folder}):`, publicUrl);
  return publicUrl;
}
