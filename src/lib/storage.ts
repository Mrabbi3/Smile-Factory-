import type { SupabaseClient } from '@supabase/supabase-js'

/** Public Supabase Storage bucket created in migration 00021. */
export const MEDIA_BUCKET = 'media'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function fileExtension(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : ''
  const ext = (fromName || file.type.split('/')[1] || 'jpg').toLowerCase()
  // keep it filesystem/url-safe
  return ext.replace(/[^a-z0-9]/g, '') || 'jpg'
}

export type UploadResult = { url: string } | { error: string }

/**
 * Upload an image to the public `media` bucket under `${folder}/...` and return
 * its public URL. Validates type and size before uploading.
 *
 * @param folder e.g. 'prizes' or 'machines'
 * @param entityId stable id used in the filename (falls back to a random id)
 */
export async function uploadMediaImage(
  supabase: SupabaseClient,
  folder: string,
  entityId: string,
  file: File
): Promise<UploadResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Please choose a JPG, PNG, WEBP, or GIF image.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: 'Image must be 5 MB or smaller.' }
  }

  const id = entityId || Math.random().toString(36).slice(2)
  const path = `${folder}/${id}-${Date.now()}.${fileExtension(file)}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    return { error: error.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}
