import { StyleSheet, ScrollView } from 'react-native'
import React from 'react'
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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <AppHeader title="Dashboard" />
      </ScrollView>
    </SafeAreaView>

  )
}

export default DashboardScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  }
})
