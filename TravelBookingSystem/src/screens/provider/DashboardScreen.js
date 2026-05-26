import { StyleSheet, View, ScrollView, Text } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import TimeRangeFilter from '../../components/TimeRangeFilter'
import CategoryFilterChips from '../../components/CategoryFilterChips'
import DashboardSummaryGrid from '../../components/DashboardSummaryGrid'
import RevenueLineChart from '../../components/RevenueLineChart'
import RevenueByTypeChart from '../../components/RevenueByTypeChart'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useAuth } from '../../../context/AuthContext'

const DashboardScreen = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')
  const [serviceType, setServiceType] = useState('all')

  const filters = useMemo(() => {
    const periodMap = {
      today: 'today',
      '7d': 'week',
      '30d': 'month',
      '90d': 'year',
    }

    const nextFilters = {
      period: periodMap[timeRange] || 'month',
    }

    if (serviceType !== 'all') {
      nextFilters.service_type = serviceType
    }

    return nextFilters
  }, [timeRange, serviceType])

  const isVerifiedProvider = Boolean(user?.is_approved || user?.is_verified_provider)
  const { data, isLoading, isError } = useDashboardStats(filters, isVerifiedProvider)

  const zeroData = useMemo(() => {
    const pointCount =
      filters.period === 'year'
        ? 12
        : filters.period === 'month'
          ? 30
          : filters.period === 'week'
            ? 7
            : 1

    return {
      summary: {
        total_revenue: '0.00',
        total_bookings: 0,
        avg_per_booking: '0.00',
        from_date: '',
        to_date: '',
      },
      by_service_type: [
        { type: 'tour', revenue: '0.00', bookings: 0, percent: 0 },
        { type: 'hotel', revenue: '0.00', bookings: 0, percent: 0 },
        { type: 'transport', revenue: '0.00', bookings: 0, percent: 0 },
      ],
      revenue_series: Array.from({ length: pointCount }, (_, index) => ({
        date: String(index),
        label: String(index + 1),
        value: '0.00',
      })),
    }
  }, [filters.period])

  const dashboardData = isVerifiedProvider ? data : zeroData
  const summary = dashboardData?.summary || null
  const byServiceType = dashboardData?.by_service_type || []
  const revenueSeries = dashboardData?.revenue_series || []

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Dashboard" />

        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        <CategoryFilterChips activeFilter={serviceType} onFilterChange={setServiceType} />

        {!isVerifiedProvider && (
          <Text style={styles.infoText}>Provider account not verified yet. Showing zero data.</Text>
        )}
        {isVerifiedProvider && isLoading && <Text style={styles.infoText}>Loading dashboard...</Text>}
        {isVerifiedProvider && isError && <Text style={styles.infoText}>Failed to load dashboard.</Text>}

        {(!isVerifiedProvider || (!isLoading && !isError)) && (
          <>
            <DashboardSummaryGrid summary={summary} />
            <RevenueLineChart items={revenueSeries} />
            <RevenueByTypeChart items={byServiceType} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default DashboardScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
})