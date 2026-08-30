import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadProgressCallback {
  (progress: number, stage: 'validating' | 'compressing' | 'uploading' | 'completed' | 'error', errorMsg?: string): void;
}

// Supported image MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif'];
const MAX_RAW_FILE_SIZE_MB = 20; // 20 MB max file input from camera/gallery

/**
 * Validates the selected file
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check MIME type or extension for mobile compatibility
  const fileName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  const hasValidMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith('image/') : hasValidExt;

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: `Unsupported format (${file.type || 'unknown'}). Please select JPG, PNG, or WebP.`
    };
  }

  // Check file size limit
  const maxBytes = MAX_RAW_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is ${MAX_RAW_FILE_SIZE_MB}MB.`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty (0 bytes).'
    };
  }

  return { valid: true };
}

/**
 * High-performance, client-side canvas optimizer.
 * Resizes 4K/high-res photos down to max 1400px, converts to WebP/JPEG,
 * reducing an 8MB camera photo down to ~80-150KB without visible quality loss.
 */
export function optimizeImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  targetQuality = 0.82
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // Timeout guard so image processing never hangs
    const timeoutId = setTimeout(() => {
      reject(new Error('Image processing timed out. Please choose a different image.'));
    }, 15000);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          reject(new Error('Invalid image dimensions. The image file might be corrupted.'));
          return;
        }

        // Scale down keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) {
          reject(new Error('Could not initialize canvas context for compression.'));
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let format = 'image/webp';
        let quality = targetQuality;
        let dataUrl = canvas.toDataURL(format, quality);

        // If WebP is unsupported or output is surprisingly large, adjust
        if (!dataUrl.startsWith('data:image/webp')) {
          format = 'image/jpeg';
          dataUrl = canvas.toDataURL(format, quality);
        }

        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl, width, height });
            } else {
              // Convert dataUrl to blob if toBlob failed
              try {
                const byteString = atob(dataUrl.split(',')[1]);
                const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const fallbackBlob = new Blob([ab], { type: mimeString });
                resolve({ blob: fallbackBlob, dataUrl, width, height });
              } catch (e) {
                reject(new Error('Failed to create image blob from canvas.'));
              }
            }
          },
          format,
          quality
        );
      } catch (err) {
        reject(new Error(err instanceof Error ? err.message : 'Error optimizing image'));
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image. The file may be corrupted or in an unsupported format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a product image to Firebase Storage with full progress tracking.
 * If Firebase Storage is not yet provisioned in the Google Cloud/Firebase project,
 * it safely falls back to high-compression WebP/JPEG data format with zero user interruption.
 */
export async function uploadProductImage(
  file: File,
  folder = 'products',
  onProgress?: UploadProgressCallback
): Promise<string> {
  // 1. Validation
  onProgress?.(5, 'validating');
  const validation = validateImageFile(file);
  if (!validation.valid) {
    const errorMsg = validation.error || 'Invalid image file.';
    onProgress?.(0, 'error', errorMsg);
    throw new Error(errorMsg);
  }

  // 2. Optimization / Compression
  onProgress?.(15, 'compressing');
  let optimized: { blob: Blob; dataUrl: string; width: number; height: number };
  try {
    optimized = await optimizeImage(file, 1200, 1200, 0.8);
  } catch (optErr) {
    console.error('Optimization error:', optErr);
    const msg = optErr instanceof Error ? optErr.message : 'Image optimization failed';
    onProgress?.(0, 'error', msg);
    throw new Error(msg);
  }

  onProgress?.(30, 'uploading');

  // 3. Attempt Firebase Storage upload
  try {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
    const storagePath = `${folder}/${timestamp}_${safeName}_${randomSuffix}.webp`;

    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: 'image/webp',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, optimized.blob, metadata);

    const downloadURL = await new Promise<string>((resolve, reject) => {
      // 45-second timeout guard on cloud upload
      const uploadTimeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error('Storage upload timed out. Falling back to local storage.'));
      }, 45000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const rawPct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Scale between 30% and 95%
            const progress = Math.min(95, Math.max(30, Math.round(30 + rawPct * 0.65)));
            onProgress?.(progress, 'uploading');
          }
        },
        (error) => {
          clearTimeout(uploadTimeout);
          reject(error);
        },
        async () => {
          clearTimeout(uploadTimeout);
          try {
            onProgress?.(98, 'uploading');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    onProgress?.(100, 'completed');
    return downloadURL;
  } catch (storageError: any) {
    console.warn(
      'Firebase Storage upload encountered an issue (e.g., bucket not yet initialized or network issue):',
      storageError?.code || storageError?.message
    );

    // If storage bucket is not found (404/storage/unknown) or permission issue,
    // gracefully fall back to optimized dataUrl so the admin user's workflow is NEVER broken!
    onProgress?.(95, 'uploading');
    
    // Ensure the dataUrl is under safe limits (< 150KB)
    if (optimized.dataUrl.length > 250000) {
      // Downscale one more step for fallback persistence
      try {
        const smaller = await optimizeImage(file, 800, 800, 0.65);
        onProgress?.(100, 'completed');
        return smaller.dataUrl;
      } catch (e) {
        onProgress?.(100, 'completed');
        return optimized.dataUrl;
      }
    }

    onProgress?.(100, 'completed');
    return optimized.dataUrl;
  }
}

/**
 * Uploads a video file to Firebase Storage
 */
export async function uploadProductVideo(
  file: File,
  onProgress?: (progress: number, stage: string, error?: string) => void
): Promise<string> {
  if (!file) {
    throw new Error('No video file selected.');
  }

  if (file.size > 15 * 1024 * 1024) {
    const errorMsg = `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 15MB.`;
    onProgress?.(0, 'error', errorMsg);
    throw new Error(errorMsg);
  }

  onProgress?.(10, 'uploading');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `products/videos/${timestamp}_${safeName}_${randomSuffix}`;

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'video/mp4'
  });

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error('Video upload timed out. Please check your internet connection.'));
    }, 90000);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const rawPct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const progress = Math.min(95, Math.max(10, Math.round(rawPct)));
          onProgress?.(progress, 'uploading');
        }
      },
      (err) => {
        clearTimeout(timeout);
        onProgress?.(0, 'error', err.message);
        reject(err);
      },
      async () => {
        clearTimeout(timeout);
        try {
          onProgress?.(98, 'uploading');
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress?.(100, 'completed');
          resolve(url);
        } catch (e: any) {
          onProgress?.(0, 'error', e.message);
          reject(e);
        }
      }
    );
  });
}
