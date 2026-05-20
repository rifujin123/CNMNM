import * as ImagePicker from "expo-image-picker";

export async function pickSingleImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Media library permission denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  return {
    uri: asset.uri,
    fileName: asset.fileName || asset.uri.split("/").pop() || "upload.jpg",
    mimeType: asset.mimeType || "image/jpeg",
  };
}