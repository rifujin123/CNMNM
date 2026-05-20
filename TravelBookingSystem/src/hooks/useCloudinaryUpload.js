import { useState } from "react";
import { uploadImageToCloudinary } from "../api/cloudinary";

export default function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const uploadImageAsync = async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      const res = await uploadImageToCloudinary(file);
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImage = (file) => {
    uploadImageAsync(file).catch(() => {});
  };

  const reset = () => {
    setIsUploading(false);
    setError(null);
    setData(null);
  };

  return {
    uploadImage,
    uploadImageAsync,
    isUploading,
    error,
    data,
    reset,
  };
}