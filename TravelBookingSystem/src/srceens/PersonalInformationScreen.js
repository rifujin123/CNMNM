import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import useCloudinaryUpload from "../hooks/useCloudinaryUpload";
import { pickSingleImage } from "../utils/pickImage";

const PersonalInformationScreen = () => {
  const { uploadImageAsync, isUploading, data: uploadData, error: uploadError } =
    useCloudinaryUpload();
  const [previewUri, setPreviewUri] = useState(null);

  const handlePickAndUpload = async () => {
    try {
      const image = await pickSingleImage();
      if (!image) return;

      const result = await uploadImageAsync(image);
      if (result?.secureUrl) {
        setPreviewUri(result.secureUrl);
      }
    } catch (err) {
      console.log("Upload error:", err?.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Information</Text>

      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={handlePickAndUpload}
        disabled={isUploading}
      >
        <Text style={styles.uploadButtonText}>
          {isUploading ? "Uploading..." : "Pick & Upload Image (Demo)"}
        </Text>
      </TouchableOpacity>

      {uploadError && (
        <Text style={styles.errorText}>Error: {uploadError.message}</Text>
      )}

      {previewUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Uploaded:</Text>
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
          <Text style={styles.urlText}>{previewUri}</Text>
        </View>
      )}
    </View>
  );
};

export default PersonalInformationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
  },
  previewContainer: {
    marginTop: 16,
  },
  previewLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  urlText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
});