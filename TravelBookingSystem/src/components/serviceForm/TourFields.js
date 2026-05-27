import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimeField from './DateTimeField';

const TourFields = ({
  formData,
  updateField,
  showDatePicker,
  setShowDatePicker,
  updateTourPackage,
  addTourPackage,
  removeTourPackage,
}) => (
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

    <View style={styles.field}>
      <View style={styles.packageHeader}>
        <Text style={styles.label}>Tour Packages *</Text>
        <TouchableOpacity style={styles.addPackageBtn} onPress={addTourPackage}>
          <Ionicons name="add" size={16} color="#0D9488" />
          <Text style={styles.addPackageText}>Add</Text>
        </TouchableOpacity>
      </View>

      {formData.tour_packages.map((pkg, index) => (
        <View key={index} style={styles.packageBox}>
          <View style={styles.packageTitleRow}>
            <Text style={styles.packageTitle}>Package {index + 1}</Text>
            {formData.tour_packages.length > 1 && (
              <TouchableOpacity onPress={() => removeTourPackage(index)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Package name"
            value={pkg.name}
            onChangeText={(val) => updateTourPackage(index, 'name', val)}
          />
          <TextInput
            style={[styles.input, styles.packagePriceInput]}
            placeholder="Package price"
            value={pkg.price}
            onChangeText={(val) => updateTourPackage(index, 'price', val)}
            keyboardType="numeric"
          />
        </View>
      ))}
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
    color: '#000',
    backgroundColor: '#FFF',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPackageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPackageText: { fontSize: 13, fontWeight: '700', color: '#0D9488' },
  packageBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#FAFAF9',
  },
  packageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: { fontSize: 13, fontWeight: '700', color: '#1C1917' },
  packagePriceInput: { marginTop: 8 },
});

export default TourFields;
