import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const VEHICLE_TYPES = ['Bus', 'Van', 'Limousine', 'Train', 'Flight'];

const TransportFields = ({ formData, updateField }) => (
  <View>
    <View style={styles.field}>
      <Text style={styles.label}>Brand Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Phương Trang"
        value={formData.brand_name}
        onChangeText={(val) => updateField('brand_name', val)}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>License Plate *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 51B-12345"
        value={formData.license_plate}
        onChangeText={(val) => updateField('license_plate', val)}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>Vehicle Type *</Text>
      <View style={styles.typeRow}>
        {VEHICLE_TYPES.map((type) => (
          <Text
            key={type}
            style={[styles.typeChip, formData.vehicle_type === type && styles.typeChipActive]}
            onPress={() => updateField('vehicle_type', type)}
          >
            {type}
          </Text>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
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
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#FFF',
  },
  typeChipActive: {
    borderColor: '#0D9488',
    backgroundColor: '#0D9488',
    color: '#FFF',
  },
});

export default TransportFields;