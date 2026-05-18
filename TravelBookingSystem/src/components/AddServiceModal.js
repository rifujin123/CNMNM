import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickSingleImage } from '../utils/pickImage';
import useCloudinaryUpload from '../hooks/useCloudinaryUpload';

const SERVICE_TYPES = [
  { id: 'tour', label: 'Tour', icon: 'map-outline' },
  { id: 'hotel', label: 'Hotel', icon: 'bed-outline' },
  { id: 'transport', label: 'Transport', icon: 'bus-outline' },
];

const AddServiceModal = ({ visible, onClose, onSubmit }) => {
  const [serviceType, setServiceType] = useState('tour');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    time_start: '',
    address_detail: '',
    brand_name: '',
    license_plate: '',
    vehicle_type: '',
    image: null,
  });
  const [imageLoading, setImageLoading] = useState(false);
  const { uploadImageAsync, isUploading } = useCloudinaryUpload();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    try {
      setImageLoading(true);
      const pickedImage = await pickSingleImage();
      if (pickedImage) {
        const uploaded = await uploadImageAsync(pickedImage);
        if (uploaded?.secureUrl) {
          updateField('image', uploaded.secureUrl);
        }
      }
    } catch (error) {
      console.error('Image pick/upload error:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = () => {
    // TODO: Validate and submit
    console.log('Submit:', serviceType, formData);
    onSubmit?.(serviceType, formData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      time_start: '',
      address_detail: '',
      brand_name: '',
      license_plate: '',
      vehicle_type: '',
      image: null,
    });
    setServiceType('tour');
    onClose();
  };

  const renderTourFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Time Start</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD HH:MM"
          value={formData.time_start}
          onChangeText={(val) => updateField('time_start', val)}
        />
      </View>
    </>
  );

  const renderHotelFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Address Detail</Text>
        <TextInput
          style={styles.input}
          placeholder="Street, district..."
          value={formData.address_detail}
          onChangeText={(val) => updateField('address_detail', val)}
        />
      </View>
    </>
  );

  const renderTransportFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Brand Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Phương Trang"
          value={formData.brand_name}
          onChangeText={(val) => updateField('brand_name', val)}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>License Plate</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 51B-12345"
          value={formData.license_plate}
          onChangeText={(val) => updateField('license_plate', val)}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Vehicle Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Bus, Train, Flight"
          value={formData.vehicle_type}
          onChangeText={(val) => updateField('vehicle_type', val)}
        />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Service</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={28} color="#1C1917" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.typeSelector}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    serviceType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setServiceType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={serviceType === type.id ? '#FFFFFF' : '#78716C'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      serviceType === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handlePickImage}
                disabled={imageLoading || isUploading}
              >
                {imageLoading || isUploading ? (
                  <ActivityIndicator size="large" color="#0D9488" />
                ) : formData.image ? (
                  <>
                    <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="camera" size={24} color="#FFFFFF" />
                      <Text style={styles.imageOverlayText}>Change</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={40} color="#78716C" />
                    <Text style={styles.imagePickerText}>Tap to upload image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Service name"
                value={formData.name}
                onChangeText={(val) => updateField('name', val)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your service..."
                value={formData.description}
                onChangeText={(val) => updateField('description', val)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Base Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.base_price}
                onChangeText={(val) => updateField('base_price', val)}
                keyboardType="numeric"
              />
            </View>

            {serviceType === 'tour' && renderTourFields()}
            {serviceType === 'hotel' && renderHotelFields()}
            {serviceType === 'transport' && renderTransportFields()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Create Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddServiceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1917',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    borderColor: '#0D9488',
    backgroundColor: '#0D9488',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1917',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#E7E5E4',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  imagePickerText: {
    color: '#78716C',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E7E5E4',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
