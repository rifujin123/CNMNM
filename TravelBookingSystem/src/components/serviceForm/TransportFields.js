import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
});

export default TransportFields;