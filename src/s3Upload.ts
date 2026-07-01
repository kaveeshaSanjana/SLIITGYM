// Use the same API proxy base as the rest of the app to avoid hardcoded ports and CORS issues
const API_URL = '/api';
export const uploadFileToS3 = async (file: File): Promise<string> => {
  try {
    // 1. Get presigned URL from backend
    const res = await fetch(`${API_URL}/upload/presigned-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
    if (!res.ok) {
      throw new Error("Failed to get presigned URL");
    }
    const data = await res.json();
    const { presignedUrl, publicUrl } = data;

    // 2. Upload file directly to S3
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload file to S3");
    }

    // 3. Return the public URL
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};
