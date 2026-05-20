import Apis from "../../configs/Apis";
import { CLOUDINARY_SIGN_ENDPOINT } from "../config/cloudinary";

function buildCloudinaryUploadUrl(cloudName) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

/**
 * Backend contract (server must implement this):
 * POST CLOUDINARY_SIGN_ENDPOINT
 * body: { folder?: string }
 * response: { timestamp, signature, apiKey, cloudName, folder }
 *
 * All Cloudinary params (apiKey, cloudName, folder) return from backend,
 * app stores ZERO Cloudinary credentials.
 */
export async function getCloudinarySignature({ folder } = {}) {
  const res = await Apis.post(CLOUDINARY_SIGN_ENDPOINT, { folder });
  return res?.data;
}

function normalizeCloudinaryResponse(data) {
  if (!data) return null;
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    raw: data,
  };
}

export async function uploadImageToCloudinary({ uri, fileName, mimeType }) {
  if (!uri) throw new Error("Missing uri");

  // Always use folder from sign response - never override from caller
  const sig = await getCloudinarySignature();
  const timestamp = sig?.timestamp;
  const signature = sig?.signature;
  const apiKey = sig?.apiKey;
  const cloudName = sig?.cloudName;
  const resolvedFolder = sig?.folder;

  if (!timestamp || !signature || !apiKey || !cloudName) {
    throw new Error("Backend must return timestamp, signature, apiKey, cloudName");
  }

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: fileName || "upload.jpg",
    type: mimeType || "image/jpeg",
  });
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  if (resolvedFolder) formData.append("folder", resolvedFolder);

  const uploadUrl = buildCloudinaryUploadUrl(cloudName);
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const json = await uploadRes.json();
  if (!uploadRes.ok) {
    const msg = json?.error?.message || "Cloudinary upload failed";
    throw new Error(msg);
  }

  return normalizeCloudinaryResponse(json);
}