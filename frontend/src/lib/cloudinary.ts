// Cloudinary upload helper — unsigned uploads from frontend
// Cloud name: dkuwxm3ax

const CLOUD_NAME = 'dkuwxm3ax';
const UPLOAD_PRESET = 'femtrack_unsigned'; // Create this preset in Cloudinary dashboard

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  original_filename: string;
}

/**
 * Upload a file to Cloudinary with progress tracking.
 * @param file - File to upload
 * @param folder - Cloudinary folder path (e.g. "doctor-licenses/uid123")
 * @param onProgress - Optional progress callback (0-100)
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

/**
 * Upload multiple files to Cloudinary.
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string,
  onProgress?: (fileIndex: number, percent: number) => void
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToCloudinary(files[i], folder, (p) => onProgress?.(i, p));
    results.push(result);
  }
  return results;
}
