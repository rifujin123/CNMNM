import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_TYPES = [
  { id: 'tour', label: 'Tour', icon: 'map-outline' },
  { id: 'hotel', label: 'Hotel', icon: 'bed-outline' },
  { id: 'transport', label: 'Transport', icon: 'bus-outline' },
];

const ServiceTypeSelector = ({ value, onChange, disabled }) => (
  <View style={styles.container}>
    {SERVICE_TYPES.map((type) => (
      <TouchableOpacity
        key={type.id}
        style={[styles.btn, value === type.id && styles.btnActive]}
        onPress={() => onChange(type.id)}
        disabled={disabled}
      >
        <Ionicons
          name={type.icon}
          size={18}
          color={value === type.id ? '#FFF' : '#78716C'}
        />
        <Text style={[styles.label, value === type.id && styles.labelActive]}>
          {type.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E7E5E4',
    backgroundColor: '#FFF',
  },
  btnActive: {
    borderColor: '#0D9488',
    backgroundColor: '#0D9488',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  labelActive: {
    color: '#FFF',
  },
});

export default ServiceTypeSelector;