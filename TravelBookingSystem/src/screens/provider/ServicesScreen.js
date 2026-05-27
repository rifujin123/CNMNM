import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '../../components/AppHeader'
import usePullRefresh from '../../../hooks/usePullRefresh'
import SearchBar from '../../components/SearchBar'
import CategoryFilterChips from '../../components/CategoryFilterChips'
import ServiceCard from '../../components/ServiceCard'
import AddServiceModal from '../../components/AddServiceModal'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../../context/AuthContext'
import { fetchPlaces, fetchHotels, fetchTransports, createService, updateService, deleteService } from '../../api/services'
import { commonStyles } from '../../styles/commonStyles'


const ServicesScreen = () => {
  const { token, user, role } = useAuth()
  const isVerifiedProvider = role === 'provider' && user?.is_verified_provider === true
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadServices = async () => {
    if (!token || !isVerifiedProvider) {
      setServices([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const ownServiceParams = {
        token,
        mine: true,
        ordering: 'newest',
      }
      const [tours, hotels, transports] = await Promise.all([
        fetchPlaces(ownServiceParams),
        fetchHotels(ownServiceParams),
        fetchTransports(ownServiceParams),
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
  }, [token, isVerifiedProvider])

  const { refreshControl } = usePullRefresh(loadServices)

  const handleAddService = () => {
    setEditingItem(null)
    setModalVisible(true)
  }

  const handleEditService = (item) => {
    setEditingItem(item)
    setModalVisible(true)
  }

  const handleCreateService = async (type, data, editingItem) => {
    try {
      if (editingItem) {
        await updateService({ token, user, type, id: editingItem.id, payload: data })
      } else {
        await createService({ token, user, type, payload: data })
      }
      await loadServices()
      setModalVisible(false)
      setEditingItem(null)
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save service')
      console.error('Create/update service error:', err)
    }
  }

  const handleDeleteService = async (item) => {
    try {
      await deleteService({ token, user, type: item.type, id: item.id })
      await loadServices()
      Alert.alert('Deleted', `${item.name} has been deleted`)
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete service')
      console.error('Delete service error:', err)
    }
  }

  if (loading && services.length === 0) {
    return (
      <SafeAreaView style={commonStyles.tabScreen}>
        <AppHeader title="Services" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!isVerifiedProvider) {
    return (
      <SafeAreaView style={commonStyles.tabScreen}>
        <AppHeader title="Services" />
        <View style={styles.centerContainer}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Account verification required</Text>
          <Text style={styles.emptySubtitle}>
            Please verify your provider account to manage services and proceed to the next step.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={commonStyles.tabScreen}>
      <ScrollView style={commonStyles.tabContent} refreshControl={refreshControl}>
        <AppHeader title="Services" />
        <SearchBar placeholder="Search services" />
        <CategoryFilterChips />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {services.length === 0 && !loading && !error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>Tap add to create your first tour, hotel, or transport service.</Text>
          </View>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={`${service.type}-${service.id}`}
              item={service}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          ))
        )}
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
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateService}
        editingItem={editingItem}
      />
    </SafeAreaView>
  )
}

export default ServicesScreen

const styles = StyleSheet.create({
  
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
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
