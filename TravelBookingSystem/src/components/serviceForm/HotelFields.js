import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const HotelFields = ({ formData, updateField }) => (
  <View>
    <View style={styles.field}>
      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="Street, district..."
        value={formData.address_detail}
        onChangeText={(val) => updateField('address_detail', val)}
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

export default HotelFields;