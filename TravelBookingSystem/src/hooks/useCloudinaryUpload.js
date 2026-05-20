import { useMutation } from "@tanstack/react-query";
import { uploadImageToCloudinary } from "../api/cloudinary";

export default function useCloudinaryUpload() {
  const mutation = useMutation({
    mutationFn: uploadImageToCloudinary,
  });

  return {
    uploadImage: mutation.mutate,
    uploadImageAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}