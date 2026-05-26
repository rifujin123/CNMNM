import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CityPicker = ({ value, onChange, cities = [] }) => {
  const [open, setOpen] = useState(false);
  const selectedCity = cities.find((city) => String(city.id) === String(value));

  return (
    <View style={styles.field}>
      <Text style={styles.label}>City *</Text>
      <TouchableOpacity style={styles.selectButton} onPress={() => setOpen((prev) => !prev)}>
        <Text style={[styles.selectText, !selectedCity && styles.placeholder]}>
          {selectedCity?.name || 'Select city'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
      </TouchableOpacity>

      {open && (
        <View style={styles.options}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[styles.option, String(city.id) === String(value) && styles.activeOption]}
              onPress={() => {
                onChange(String(city.id));
                setOpen(false);
              }}
            >
              <Text style={[styles.optionText, String(city.id) === String(value) && styles.activeOptionText]}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 },
  selectButton: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 14, color: '#1C1917' },
  placeholder: { color: '#94A3B8' },
  options: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  option: { paddingHorizontal: 12, paddingVertical: 11 },
  activeOption: { backgroundColor: '#ECFDF5' },
  optionText: { fontSize: 14, color: '#334155' },
  activeOptionText: { color: '#0D9488', fontWeight: '700' },
});

export default CityPicker;