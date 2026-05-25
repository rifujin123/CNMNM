import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const DateTimeField = ({ label, value, onChange, required = true, showPicker, onShowPicker }) => {
  const dateValue = value ? new Date(value) : new Date();
  const isValid = value && !Number.isNaN(dateValue.getTime());

  const dateText = isValid
    ? dateValue.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Select date';

  const timeText = isValid
    ? dateValue.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : 'Select time';

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TouchableOpacity style={styles.btn} onPress={onShowPicker}>
        <View style={styles.pills}>
          <View style={[styles.pill, !isValid && styles.pillEmpty]}>
            <Ionicons name="calendar-outline" size={13} color={isValid ? '#0D9488' : '#94A3B8'} />
            <Text style={[styles.pillText, !isValid && styles.pillTextEmpty]}>{dateText}</Text>
          </View>
          <View style={[styles.pill, !isValid && styles.pillEmpty]}>
            <Ionicons name="time-outline" size={13} color={isValid ? '#0D9488' : '#94A3B8'} />
            <Text style={[styles.pillText, !isValid && styles.pillTextEmpty]}>{timeText}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={16} color="#78716C" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={isValid ? dateValue : new Date()}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            onShowPicker(false);
            if (event.type === 'set' && selectedDate) {
              onChange(selectedDate.toISOString().slice(0, 19));
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#CCFBF1',
  },
  pillEmpty: { backgroundColor: '#F1F5F9' },
  pillText: { fontSize: 11, fontWeight: '600', color: '#0F766E' },
  pillTextEmpty: { color: '#94A3B8' },
});

export default DateTimeField;