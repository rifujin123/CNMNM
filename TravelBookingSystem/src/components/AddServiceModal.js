import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCities } from '../api/services';
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
  vehicle_type: '',
  time_start: '',
  empty_slot: '',
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
        vehicle_type: editingItem.vehicle_type || '',
        time_start: editingItem.time_start || '',
        empty_slot: String(editingItem.empty_slot || ''),
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

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name required';
    if (!formData.description.trim()) return 'Description required';
    if (!formData.city) return 'City required';
    if (!formData.base_price) return 'Price required';

    if (serviceType === 'tour') {
      if (!formData.time_start) return 'Time start required';
      if (!formData.empty_slot) return 'Empty slot required';
    }

    if (serviceType === 'hotel' && !formData.address_detail.trim()) {
      return 'Address required';
    }

    if (serviceType === 'transport') {
      if (!formData.brand_name.trim()) return 'Brand name required';
      if (!formData.vehicle_type.trim()) return 'Vehicle type required';
    }

    return '';
  };

  const handleSubmit = () => {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    onSubmit?.(serviceType, formData, editingItem);
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
