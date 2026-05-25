import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const DashboardSummaryCard = ({ title, value, accent }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: accent || '#0D9488' }]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

export default DashboardSummaryCard

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    minHeight: 110,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
})