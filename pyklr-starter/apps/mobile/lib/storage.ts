import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Supabase Storage upload utilities for PYKLR.
 *
 * Buckets:
 * - `court-photos`: Court submission photos
 * - `avatars`: Profile photos
 * - `forum-images`: Forum post images (future)
 *
 * All uploads use the authenticated user's session for RLS.
 */

export type UploadResult = {
  publicUrl: string;
  path: string;
};

/**
 * Pick an image from the camera roll or camera, then upload to Supabase Storage.
 *
 * @param bucket - The storage bucket name
 * @param folder - Subfolder path (e.g., userId or courtId)
 * @param source - 'library' for photo roll, 'camera' for live capture
 * @returns The public URL and storage path, or null if cancelled
 */
export async function pickAndUploadImage(
  bucket: string,
  folder: string,
  source: 'library' | 'camera' = 'library'
): Promise<UploadResult | null> {
  // Request permission
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return null;
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to select images.');
      return null;
    }
  }

  // Launch picker
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];

  // Determine file extension from mime type
  const ext = asset.mimeType?.split('/')[1] ?? 'jpg';
  const fileName = `${folder}/${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  if (asset.base64) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, decode(asset.base64), {
        contentType: asset.mimeType ?? 'image/jpeg',
        upsert: false,
      });

    if (error) {
      Alert.alert('Upload failed', error.message);
      return null;
    }
  } else if (asset.uri) {
    // Fallback: upload from URI (works on web and some platforms)
    const response = await fetch(asset.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from(bucket).upload(fileName, blob, {
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: false,
    });

    if (error) {
      Alert.alert('Upload failed', error.message);
      return null;
    }
  }

  // Get public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return {
    publicUrl: data.publicUrl,
    path: fileName,
  };
}

/**
 * Upload a profile avatar.
 * Replaces the existing avatar if present.
 */
export async function uploadAvatar(
  userId: string,
  source: 'library' | 'camera' = 'library'
): Promise<UploadResult | null> {
  const result = await pickAndUploadImage('avatars', userId, source);
  if (result) {
    // Update the profile with the new avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: result.publicUrl })
      .eq('id', userId);
  }
  return result;
}

/**
 * Upload court photos (up to 4).
 * Returns array of public URLs.
 */
export async function uploadCourtPhoto(
  courtId: string,
  source: 'library' | 'camera' = 'library'
): Promise<UploadResult | null> {
  return pickAndUploadImage('court-photos', courtId, source);
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn('Failed to delete storage file:', error.message);
  }
}
