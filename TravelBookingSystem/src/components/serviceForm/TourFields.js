import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import DateTimeField from './DateTimeField';

const TourFields = ({ formData, updateField, showDatePicker, setShowDatePicker }) => (
  <View>
    <DateTimeField
      label="Time Start"
      value={formData.time_start}
      onChange={(val) => updateField('time_start', val)}
      showPicker={showDatePicker === 'time_start'}
      onShowPicker={(val) => setShowDatePicker(val ? 'time_start' : null)}
    />

    <View style={styles.field}>
      <Text style={styles.label}>Empty Slot *</Text>
      <TextInput
        style={styles.input}
        placeholder="20"
        value={formData.empty_slot}
        onChangeText={(val) => updateField('empty_slot', val)}
        keyboardType="numeric"
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

export default TourFields;