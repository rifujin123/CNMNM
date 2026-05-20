import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../components/AppHeader'
import usePullRefresh from '../../hooks/usePullRefresh'
import SearchBar from '../components/SearchBar'
import StatsBar from '../components/StatsBar'
import CategoryFilterChips from '../components/CategoryFilterChips'
import ServiceCard from '../components/ServiceCard'
import AddServiceModal from '../components/AddServiceModal'
import { Ionicons } from '@expo/vector-icons'


const ServicesScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const { refreshControl } = usePullRefresh(() => {
    // Simulate data refresh
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  });

  const handleAddService = () => {
    setModalVisible(true);
  };

  const handleCreateService = (type, data) => {
    // TODO: Connect to backend API
    console.log('Create service payload:', type, data);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} refreshControl={refreshControl}>
        <AppHeader title="Services" />
        <SearchBar placeholder="Search services" />
        <StatsBar />
        <CategoryFilterChips />
        <ServiceCard />
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddService}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AddServiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateService}
      />
    </SafeAreaView>
  )
}

export default ServicesScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
})