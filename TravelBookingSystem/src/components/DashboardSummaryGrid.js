import { StyleSheet, View } from 'react-native'
import React from 'react'
import DashboardSummaryCard from './DashboardSummaryCard'

const formatMillions = (value) => `${(Number(value || 0) / 1000000).toFixed(2)}M`

const DashboardSummaryGrid = ({ summary }) => {
  const totalRevenue = formatMillions(summary?.total_revenue)
  const totalBookings = summary?.total_bookings ?? 0
  const avgPerBooking = formatMillions(summary?.avg_per_booking)

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <DashboardSummaryCard
          title="Revenue"
          value={totalRevenue}
          accent="#0D9488"
        />
        <DashboardSummaryCard
          title="Bookings"
          value={String(totalBookings)}
          accent="#4F46E5"
        />
      </View>
      <View style={styles.row}>
        <DashboardSummaryCard
          title="Avg/Booking"
          value={avgPerBooking}
          accent="#10B981"
        />
      </View>
    </View>
  )
}

export default DashboardSummaryGrid

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
})