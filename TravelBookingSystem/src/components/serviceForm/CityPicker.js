import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CityPicker = ({ value, onChange, cities }) => (
  <View style={styles.field}>
    <Text style={styles.label}>City *</Text>
    <View style={styles.pickerWrap}>
      <Picker selectedValue={value} onValueChange={onChange}>
        <Picker.Item label="Select city" value="" />
        {cities.map((city) => (
          <Picker.Item key={city.id} label={city.name} value={String(city.id)} />
        ))}
      </Picker>
    </View>
  </View>
);

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
});

export default CityPicker;