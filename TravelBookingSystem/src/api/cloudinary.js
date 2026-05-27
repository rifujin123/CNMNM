import Apis from "../../configs/Apis";
import { CLOUDINARY_SIGN_ENDPOINT } from "../config/cloudinary";

function buildCloudinaryUploadUrl(cloudName) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

export async function getCloudinarySignature({ folder } = {}) {
  const res = await Apis.post(CLOUDINARY_SIGN_ENDPOINT, { folder });
  return res?.data;
}

export async function uploadImageToCloudinary({ uri, fileName, mimeType }) {
  if (!uri) throw new Error("Missing uri");

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

  return json;
}