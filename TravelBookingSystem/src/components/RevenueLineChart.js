import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LineChart } from 'react-native-gifted-charts'

const RevenueLineChart = ({ items = [] }) => {
  const data = items.map((item) => ({
    value: Number(item?.value || 0) / 1000000,
    label: item?.label || '',
  }))

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue Trend</Text>
      <LineChart
        data={data}
        width={320}
        height={200}
        color="#0D9488"
        thickness={3}
        curved
        noOfSections={5}
        yAxisColor="#E5E7EB"
        xAxisColor="#E5E7EB"
        yAxisTextStyle={{ color: '#64748B', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#64748B', fontSize: 10 }}
        yAxisLabelSuffix="M"
        dataPointsColor="#0D9488"
        dataPointsRadius={4}
      />
    </View>
  )
}

export default RevenueLineChart

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
})

