import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BarChart } from 'react-native-gifted-charts'

const RevenueByTypeChart = ({ items = [] }) => {
  const colors = {
    transport: '#F59E0B',
    hotel: '#10B981',
    tour: '#4F46E5',
  }

  const labels = {
    transport: 'Transport',
    hotel: 'Hotel',
    tour: 'Tour',
  }

  const data = items.map((item) => ({
    value: Number(item?.revenue || 0),
    label: labels[item?.type] || item?.type || 'Other',
    frontColor: colors[item?.type] || '#94A3B8',
    topLabelComponent: () => <Text style={styles.topLabel}>{item?.revenue || 0}</Text>,
  }))

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue by Service</Text>
      <BarChart
        data={data}
        width={320}
        height={240}
        barWidth={50}
        spacing={30}
        hideRules
        xAxisColor="#E5E7EB"
        yAxisColor="#E5E7EB"
        yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#64748B', fontSize: 12, fontWeight: '500' }}
        noOfSections={5}
      />
    </View>
  )
}

export default RevenueByTypeChart

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  topLabel: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
})
