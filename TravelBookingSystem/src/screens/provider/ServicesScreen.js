import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import usePullRefresh from '../../../hooks/usePullRefresh'
import SearchBar from '../../components/SearchBar'
import StatsBar from '../../components/StatsBar'
import CategoryFilterChips from '../../components/CategoryFilterChips'
import ServiceCard from '../../components/ServiceCard'
import AddServiceModal from '../../components/AddServiceModal'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../../context/AuthContext'
import { fetchPlaces, fetchHotels, fetchTransports, createService, updateService, deleteService } from '../../api/services'


const ServicesScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const loadServices = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [tours, hotels, transports] = await Promise.all([
        fetchPlaces({ token }),
        fetchHotels({ token }),
        fetchTransports({ token }),
      ])
      setServices([...tours, ...hotels, ...transports])
    } catch (err) {
      setError(err.message || 'Failed to load services')
      console.error('Load services error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [token])

  const { refreshControl } = usePullRefresh(loadServices)

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
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {services.map((service) => (
          <ServiceCard
            key={`${service.type}-${service.id}`}
            item={service}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        ))}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
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