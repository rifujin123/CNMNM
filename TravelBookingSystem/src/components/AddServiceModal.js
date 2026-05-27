import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles } from '../styles/commonStyles';
import { fetchCities } from '../api/services';
import { pickSingleImage } from '../utils/pickImage';
import ServiceTypeSelector from './serviceForm/ServiceTypeSelector';
import DateTimeField from './serviceForm/DateTimeField';
import CityPicker from './serviceForm/CityPicker';
import TourFields from './serviceForm/TourFields';
import HotelFields from './serviceForm/HotelFields';
import TransportFields from './serviceForm/TransportFields';

const createEmptyForm = () => ({
  name: '',
  description: '',
  city: '',
  base_price: '',
  address_detail: '',
  brand_name: '',
  license_plate: '',
  image: null,
  oldImage: '',
  time_start: '',
  empty_slot: '',
  tour_packages: [{ name: '', price: '' }],
});

const AddServiceModal = ({ visible, onClose, onSubmit, editingItem = null }) => {
  const [serviceType, setServiceType] = useState('tour');
  const [formData, setFormData] = useState(createEmptyForm());
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(null);

  const isEditing = Boolean(editingItem);

  useEffect(() => {
    if (visible) {
      fetchCities().then((data) => setCities(data));
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (editingItem) {
      setServiceType(editingItem.type);
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        city: String(editingItem.city?.id || editingItem.city),
        base_price: String(editingItem.base_price),
        address_detail: editingItem.address_detail || '',
        brand_name: editingItem.brand_name || '',
        license_plate: editingItem.license_plate || '',
        image: null,
        oldImage: editingItem.image || '',
        time_start: editingItem.time_start || '',
        empty_slot: String(editingItem.empty_slot || ''),
        tour_packages: editingItem.tour_package?.length
          ? editingItem.tour_package.map((pkg) => ({
              name: pkg.name || '',
              price: String(pkg.price || ''),
            }))
          : [{ name: '', price: '' }],
      });
      setError('');
      return;
    }

    setServiceType('tour');
    setFormData(createEmptyForm());
    setError('');
  }, [visible, editingItem]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTourPackage = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.tour_packages];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, tour_packages: next };
    });
  };

  const addTourPackage = () => {
    setFormData((prev) => ({
      ...prev,
      tour_packages: [...prev.tour_packages, { name: '', price: '' }],
    }));
  };

  const removeTourPackage = (index) => {
    setFormData((prev) => ({
      ...prev,
      tour_packages: prev.tour_packages.filter((_, i) => i !== index),
    }));
  };

  const handlePickImage = async () => {
    try {
      const image = await pickSingleImage();
      if (image) {
        updateField('image', image);
      }
    } catch (err) {
      setError('Photo library permission required');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name required';
    if (!formData.description.trim()) return 'Description required';
    if (!formData.city) return 'City required';
    if (!formData.base_price) return 'Price required';

    if (serviceType === 'tour') {
      if (!formData.time_start) return 'Time start required';
      if (!formData.empty_slot) return 'Empty slot required';
      for (const pkg of formData.tour_packages) {
        if (!pkg.name.trim()) return 'Package name required';
        if (!pkg.price) return 'Package price required';
      }
    }

    if (serviceType === 'hotel' && !formData.address_detail.trim()) {
      return 'Address required';
    }

    if (serviceType === 'transport' && !formData.brand_name.trim()) {
      return 'Brand name required';
    }

    return '';
  };

  const handleSubmit = () => {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    let submitData = {
      name: formData.name,
      description: formData.description,
      city: formData.city,
      base_price: formData.base_price,
    };
    if (formData.image) {
      submitData.image = formData.image;
    }

    if (serviceType === 'tour') {
      submitData.time_start = formData.time_start;
      submitData.empty_slot = formData.empty_slot;
      submitData.tour_packages = formData.tour_packages.map((pkg) => ({
        name: pkg.name.trim(),
        price: pkg.price,
        packages: [],
      }));
    }

    if (serviceType === 'hotel') {
      submitData.address_detail = formData.address_detail;
    }

    if (serviceType === 'transport') {
      submitData.brand_name = formData.brand_name;
      submitData.license_plate = formData.license_plate;
    }
    setError('');
    onSubmit?.(serviceType, submitData, editingItem);
  };

  const handleClose = () => {
    setFormData(createEmptyForm());
    setServiceType('tour');
    setError('');
    setShowDatePicker(null);
    onClose?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Edit Service' : 'Add Service'}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#1C1917" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <ServiceTypeSelector value={serviceType} onChange={setServiceType} disabled={isEditing} />

            {!!error && <Text style={styles.error}>{error}</Text>}

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
                style={[styles.input, styles.textarea]}
                placeholder="Describe..."
                value={formData.description}
                onChangeText={(val) => updateField('description', val)}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Image</Text>
              <TouchableOpacity style={commonStyles.uploadButton} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={20} color="#1D4ED8" />
                <Text style={commonStyles.uploadButtonText}>
                  {formData.image ? 'Change Image' : 'Upload Image'}
                </Text>
              </TouchableOpacity>
              {(formData.image || formData.oldImage) && (
                <View style={commonStyles.uploadPreview}>
                  <Image source={{ uri: formData.image?.uri || formData.oldImage }} style={commonStyles.uploadPreviewImage} />
                  <Text style={commonStyles.uploadPreviewText} numberOfLines={1}>
                    {formData.image?.fileName || formData.image?.name || 'Current image'}
                  </Text>
                </View>
              )}
            </View>

            <CityPicker value={formData.city} onChange={(val) => updateField('city', val)} cities={cities} />

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

            {serviceType === 'tour' && (
              <TourFields
                formData={formData}
                updateField={updateField}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                updateTourPackage={updateTourPackage}
                addTourPackage={addTourPackage}
                removeTourPackage={removeTourPackage}
              />
            )}

            {serviceType === 'hotel' && <HotelFields formData={formData} updateField={updateField} />}

            {serviceType === 'transport' && <TransportFields formData={formData} updateField={updateField} />}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>{isEditing ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1917' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  textarea: { minHeight: 80, paddingTop: 10 },
  error: { color: '#DC2626', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#1C1917' },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});

export default AddServiceModal;
