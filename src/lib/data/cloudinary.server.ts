import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

function getEnvVar(key: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return (import.meta.env[key] as string) || "";
  }
  return "";
}

const cloudName = getEnvVar("CLOUDINARY_CLOUD_NAME") || "drcfpswre";
const apiKey = getEnvVar("CLOUDINARY_API_KEY") || "215583346439474";
const apiSecret = getEnvVar("CLOUDINARY_API_SECRET") || "Knl7z02l-l7S9Elh8M1mY78oX98";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Upload an image (base64 or data URI or buffer) directly to Cloudinary
 */
export async function uploadImageToCloudinary(input: {
  base64: string;
  contentType?: string;
  fileName?: string;
  folder?: string;
}): Promise<CloudinaryUploadResult> {
  const folder = input.folder || "mashtool/products";
  
  // Format as data URI if not already formatted
  let fileData = input.base64;
  if (!fileData.startsWith("data:")) {
    const mime = input.contentType || "image/webp";
    fileData = `data:${mime};base64,${input.base64}`;
  }

  // Generate a clean public_id prefix from filename if provided
  let publicId: string | undefined = undefined;
  if (input.fileName) {
    const cleanName = input.fileName
      .replace(/\.[^/.]+$/, "") // strip extension
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    publicId = `${cleanName}_${Date.now()}`;
  }

  const result: UploadApiResponse = await cloudinary.uploader.upload(fileData, {
    folder,
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
  };
}

export { cloudinary };
