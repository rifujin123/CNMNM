import { StyleSheet, View } from 'react-native'
import React from 'react'
import DashboardSummaryCard from './DashboardSummaryCard'

const DashboardSummaryGrid = ({ summary }) => {
  const totalRevenue = summary?.total_revenue ?? '0.00'
  const totalBookings = summary?.total_bookings ?? 0
  const avgPerBooking = summary?.avg_per_booking ?? '0.00'

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
        <DashboardSummaryCard
          title="Range"
          value={summary?.from_date ? 'Set' : 'None'}
          accent="#F59E0B"
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