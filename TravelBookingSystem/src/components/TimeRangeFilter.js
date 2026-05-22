import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState } from 'react'

const TimeRangeFilter = ({ value, onChange }) => {
  const options = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ]

  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          style={[
            styles.button,
            value === opt.id && styles.buttonActive,
          ]}
          onPress={() => onChange(opt.id)}
        >
          <Text
            style={[
              styles.buttonText,
              value === opt.id && styles.buttonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

export default TimeRangeFilter

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
})