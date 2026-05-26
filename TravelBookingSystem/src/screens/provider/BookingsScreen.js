import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ScrollView, Pressable } from 'react-native'
import React, { useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import AppHeader from '../../components/AppHeader'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    id: 'BK001',
    customer: { avatar: null, name: 'Nguyen Van An', email: 'an.nv@email.com' },
    service: { name: 'Ha Long Bay Cruise', type: 'tour', base_price: 2500000 },
    quantity: 2,
    total_price: 5000000,
    booking_status: 'confirmed',
    payment_status: 'paid',
    created_at: '2026-05-18',
    payment: { method: 'Credit Card', status: 'paid', transaction_id: 'TXN882211', paid_at: '2026-05-18' },
  },
  {
    id: 'BK002',
    customer: { avatar: null, name: 'Tran Thi Bich', email: 'bich.tt@email.com' },
    service: { name: 'Sai Gon Grand Hotel', type: 'hotel', base_price: 1800000 },
    quantity: 3,
    total_price: 5400000,
    booking_status: 'pending',
    payment_status: 'unpaid',
    created_at: '2026-05-19',
    payment: { method: 'Bank Transfer', status: 'unpaid', transaction_id: null, paid_at: null },
  },
  {
    id: 'BK003',
    customer: { avatar: null, name: 'Le Hoang Cuong', email: 'cuong.lh@email.com' },
    service: { name: 'Airport Shuttle Da Nang', type: 'transport', base_price: 350000 },
    quantity: 1,
    total_price: 350000,
    booking_status: 'completed',
    payment_status: 'paid',
    created_at: '2026-05-15',
    payment: { method: 'Momo', status: 'paid', transaction_id: 'TXN445566', paid_at: '2026-05-15' },
  },
  {
    id: 'BK004',
    customer: { avatar: null, name: 'Pham Minh Duc', email: 'duc.pm@email.com' },
    service: { name: 'Sapa Trekking Tour', type: 'tour', base_price: 3200000 },
    quantity: 4,
    total_price: 12800000,
    booking_status: 'cancelled',
    payment_status: 'refunded',
    created_at: '2026-05-17',
    payment: { method: 'Credit Card', status: 'refunded', transaction_id: 'TXN778899', paid_at: '2026-05-17' },
  },
  {
    id: 'BK005',
    customer: { avatar: null, name: 'Vo Thanh Hoa', email: 'hoa.vt@email.com' },
    service: { name: 'Nha Trang Beach Resort', type: 'hotel', base_price: 4200000 },
    quantity: 2,
    total_price: 8400000,
    booking_status: 'pending',
    payment_status: 'pending',
    created_at: '2026-05-20',
    payment: { method: 'Bank Transfer', status: 'pending', transaction_id: 'TXN112233', paid_at: null },
  },
  {
    id: 'BK006',
    customer: { avatar: null, name: 'Dang Quoc Viet', email: 'viet.dq@email.com' },
    service: { name: 'Hoi An Ancient Town Tour', type: 'tour', base_price: 1500000 },
    quantity: 2,
    total_price: 3000000,
    booking_status: 'confirmed',
    payment_status: 'paid',
    created_at: '2026-05-16',
    payment: { method: 'Momo', status: 'paid', transaction_id: 'TXN334455', paid_at: '2026-05-16' },
  },
  {
    id: 'BK007',
    customer: { avatar: null, name: 'Bui Thi Lan', email: 'lan.bt@email.com' },
    service: { name: 'Private Car Hue - Da Nang', type: 'transport', base_price: 800000 },
    quantity: 1,
    total_price: 800000,
    booking_status: 'pending',
    payment_status: 'failed',
    created_at: '2026-05-21',
    payment: { method: 'Credit Card', status: 'failed', transaction_id: 'TXN556677', paid_at: null },
  },
]

// ─── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <View style={[s.badge, { backgroundColor: color.bg }]}>
    <Text style={[s.badgeText, { color: color.text }]}>{label}</Text>
  </View>
)

const BOOKING_COLORS = {
  pending: { bg: '#FEF3C7', text: '#B45309' },
  confirmed: { bg: '#DBEAFE', text: '#1D4ED8' },
  completed: { bg: '#DCFCE7', text: '#166534' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
}

const PAYMENT_COLORS = {
  unpaid: { bg: '#F3F4F6', text: '#64748B' },
  pending: { bg: '#FEF3C7', text: '#B45309' },
  paid: { bg: '#DCFCE7', text: '#166534' },
  failed: { bg: '#FEE2E2', text: '#991B1B' },
  refunded: { bg: '#F3E8FF', text: '#9333EA' },
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ value, label, bg, color }) => (
  <View style={[s.summaryCard, { backgroundColor: bg, borderColor: '#E2E8F0' }]}>
    <Text style={[s.summaryValue, { color }]}>{value}</Text>
    <Text style={s.summaryLabel}>{label}</Text>
  </View>
)

// ─── Filter Chips ─────────────────────────────────────────────────────────────
const FilterChips = ({ options, selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {options.map((opt) => {
      const isActive = selected === opt.id
      return (
        <Pressable
          key={opt.id}
          style={[s.chip, isActive && s.chipActive]}
          onPress={() => onSelect(opt.id)}
        >
          <Text style={[s.chipText, isActive && s.chipTextActive]}>{opt.label}</Text>
        </Pressable>
      )
    })}
  </ScrollView>
)

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onPress }) => (
  <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
    <View style={s.cardRow}>
      <View style={s.avatar}>
        <Ionicons name="person" size={scale(14)} color="#64748B" />
      </View>
      <Text style={s.customerName} numberOfLines={1}>{booking.customer.name}</Text>
      <Badge label={booking.booking_status} color={BOOKING_COLORS[booking.booking_status]} />
    </View>

    <Text style={s.serviceName}>{booking.service.name}</Text>
    <Text style={s.serviceType}>{booking.service.type.toUpperCase()}</Text>

    <View style={s.cardRow}>
      <Ionicons name="calendar-outline" size={scale(12)} color="#64748B" />
      <Text style={s.cardText}>{booking.created_at}</Text>
      <Ionicons name="copy-outline" size={scale(12)} color="#64748B" />
      <Text style={s.cardText}>x{booking.quantity}</Text>
    </View>

    <View style={s.cardRowSpace}>
      <Text style={s.price}>
        <FontAwesome6 name="dong-sign" size={scale(10)} color="#0F172A" /> {booking.total_price.toLocaleString('vi-VN')}
      </Text>
      <View style={s.cardRow}>
        <Badge label={booking.payment_status} color={PAYMENT_COLORS[booking.payment_status]} />
        <Ionicons name="chevron-forward" size={scale(16)} color="#94A3B8" />
      </View>
    </View>
  </TouchableOpacity>
)

// ─── Detail Section ───────────────────────────────────────────────────────────
const DetailSection = ({ title, children }) => (
  <View style={s.detailSection}>
    <Text style={s.detailTitle}>{title}</Text>
    {children}
  </View>
)

const DetailRow = ({ label, value }) => (
  <View style={s.detailRow}>
    <Text style={s.detailLabel}>{label}</Text>
    <Text style={s.detailValue}>{value}</Text>
  </View>
)

// ─── Detail Screen ────────────────────────────────────────────────────────────
const BookingDetail = ({ booking, onBack }) => (
  <SafeAreaView style={s.container}>
    <View style={s.detailHeader}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={scale(22)} color="#0F172A" />
      </TouchableOpacity>
      <Text style={s.detailHeaderText}>Booking Detail</Text>
      <View style={{ width: scale(22) }} />
    </View>

    <ScrollView style={s.detailScroll}>
      <DetailSection title="Customer">
        <View style={s.detailCustomer}>
          <View style={s.detailAvatar}>
            <Ionicons name="person" size={scale(20)} color="#64748B" />
          </View>
          <View>
            <Text style={s.detailName}>{booking.customer.name}</Text>
            <Text style={s.detailEmail}>{booking.customer.email}</Text>
          </View>
        </View>
      </DetailSection>

      <DetailSection title="Service">
        <DetailRow label="Name" value={booking.service.name} />
        <DetailRow label="Type" value={booking.service.type.toUpperCase()} />
        <DetailRow label="Price" value={booking.service.base_price.toLocaleString('vi-VN') + ' VND'} />
      </DetailSection>

      <DetailSection title="Booking">
        <DetailRow label="ID" value={booking.id} />
        <DetailRow label="Quantity" value={booking.quantity} />
        <DetailRow label="Total" value={booking.total_price.toLocaleString('vi-VN') + ' VND'} />
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Status</Text>
          <Badge label={booking.booking_status} color={BOOKING_COLORS[booking.booking_status]} />
        </View>
        <DetailRow label="Created" value={booking.created_at} />
      </DetailSection>

      <DetailSection title="Payment">
        <DetailRow label="Method" value={booking.payment.method} />
        <View style={s.detailRow}>
          <Text style={s.detailLabel}>Status</Text>
          <Badge label={booking.payment_status} color={PAYMENT_COLORS[booking.payment_status]} />
        </View>
        <DetailRow label="Transaction ID" value={booking.payment.transaction_id || 'N/A'} />
        <DetailRow label="Paid At" value={booking.payment.paid_at || 'N/A'} />
      </DetailSection>

      {booking.booking_status === 'pending' && (
        <View style={s.detailActions}>
          <TouchableOpacity style={[s.btn, s.btnConfirm]}>
            <Text style={s.btnText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.btnCancel]}>
            <Text style={s.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: verticalScale(40) }} />
    </ScrollView>
  </SafeAreaView>
)

// ─── Filters ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'tour', label: 'Tour' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'transport', label: 'Transport' },
]

const Filters = ({ filters, setFilters }) => (
  <View style={s.filters}>
    <Text style={s.filterLabel}>Status</Text>
    <FilterChips
      options={STATUS_OPTIONS}
      selected={filters.status}
      onSelect={(id) => setFilters({ ...filters, status: id })}
    />

    <Text style={s.filterLabel}>Service Type</Text>
    <FilterChips
      options={TYPE_OPTIONS}
      selected={filters.serviceType}
      onSelect={(id) => setFilters({ ...filters, serviceType: id })}
    />

    <View style={s.search}>
      <Ionicons name="search-outline" size={scale(14)} color="#94A3B8" />
      <TextInput
        style={s.searchInput}
        placeholder="Search customer..."
        placeholderTextColor="#94A3B8"
        value={filters.search}
        onChangeText={(text) => setFilters({ ...filters, search: text })}
      />
    </View>
  </View>
)

// ─── Summary ───────────────────────────────────────────────────────────────────
const Summary = ({ bookings }) => {
  const total = bookings.length
  const pending = bookings.filter(b => b.booking_status === 'pending').length
  const confirmed = bookings.filter(b => b.booking_status === 'confirmed').length

  return (
    <View style={s.summaryRow}>
      <SummaryCard value={total} label="Total" bg="#F8FAFC" color="#0F172A" />
      <SummaryCard value={pending} label="Pending" bg="#FEF3C7" color="#B45309" />
      <SummaryCard value={confirmed} label="Confirmed" bg="#DBEAFE" color="#1D4ED8" />
    </View>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
const BookingsScreen = () => {
  const [filters, setFilters] = useState({ status: 'all', serviceType: 'all', search: '' })
  const [selected, setSelected] = useState(null)

  if (selected) {
    return <BookingDetail booking={selected} onBack={() => setSelected(null)} />
  }

  const filtered = useMemo(() => {
    return MOCK_BOOKINGS.filter((b) => {
      if (filters.status !== 'all' && b.booking_status !== filters.status) return false
      if (filters.serviceType !== 'all' && b.service.type !== filters.serviceType) return false
      if (filters.search && !b.customer.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [filters])

  return (
    <SafeAreaView style={s.container}>
      <AppHeader title="Bookings" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Summary bookings={MOCK_BOOKINGS} />
            <Filters filters={filters} setFilters={setFilters} />
          </View>
        }
        renderItem={({ item }) => <BookingCard booking={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="calendar-outline" size={scale(40)} color="#CBD5E1" />
            <Text style={s.emptyTitle}>No Bookings</Text>
            <Text style={s.emptyText}>Try different filters</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? s.emptyContainer : s.list}
      />
    </SafeAreaView>
  )
}

export default BookingsScreen

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Summary
  summaryRow: { flexDirection: 'row', paddingHorizontal: scale(16), paddingTop: verticalScale(12), gap: scale(10) },
  summaryCard: { flex: 1, borderRadius: scale(14), paddingVertical: verticalScale(12), paddingHorizontal: scale(10), alignItems: 'center', borderWidth: 1 },
  summaryValue: { fontSize: moderateScale(20), fontWeight: '800' },
  summaryLabel: { fontSize: moderateScale(10), color: '#64748B', marginTop: verticalScale(2) },

  // Filters
  filters: { paddingHorizontal: scale(16), paddingTop: verticalScale(12) },
  filterLabel: { fontSize: moderateScale(11), fontWeight: '700', color: '#0F172A', marginTop: verticalScale(4), marginBottom: verticalScale(4) },
  chip: { paddingHorizontal: scale(12), paddingVertical: verticalScale(5), borderRadius: scale(8), backgroundColor: '#F3F4F6', marginRight: scale(8) },
  chipActive: { backgroundColor: '#0F172A' },
  chipText: { fontSize: moderateScale(11), fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: scale(10), paddingHorizontal: scale(10), marginTop: verticalScale(8), height: verticalScale(36) },
  searchInput: { flex: 1, fontSize: moderateScale(12), color: '#0F172A', marginLeft: scale(6) },

  // Card
  card: { backgroundColor: '#FFFFFF', borderRadius: scale(14), padding: scale(12), marginBottom: verticalScale(10), shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
  cardRowSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: verticalScale(8) },
  avatar: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  customerName: { flex: 1, fontSize: moderateScale(13), fontWeight: '700', color: '#0F172A' },
  serviceName: { fontSize: moderateScale(14), fontWeight: '600', color: '#0F172A', marginTop: verticalScale(6) },
  serviceType: { fontSize: moderateScale(10), color: '#64748B', fontWeight: '700', marginTop: verticalScale(2) },
  cardText: { fontSize: moderateScale(11), color: '#64748B' },
  price: { fontSize: moderateScale(13), fontWeight: '700', color: '#0F172A' },

  // Badge
  badge: { paddingHorizontal: scale(6), paddingVertical: verticalScale(3), borderRadius: scale(10) },
  badgeText: { fontSize: moderateScale(9), fontWeight: '800' },

  // Empty
  empty: { alignItems: 'center', paddingTop: verticalScale(80), paddingHorizontal: scale(20) },
  emptyContainer: { flexGrow: 1 },
  emptyTitle: { fontSize: moderateScale(16), fontWeight: '700', color: '#0F172A', marginTop: verticalScale(10) },
  emptyText: { fontSize: moderateScale(12), color: '#64748B', marginTop: verticalScale(4) },
  list: { paddingHorizontal: scale(16), paddingBottom: verticalScale(20) },

  // Detail
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingVertical: verticalScale(10), borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  detailHeaderText: { fontSize: moderateScale(16), fontWeight: '700', color: '#0F172A' },
  detailScroll: { flex: 1, paddingHorizontal: scale(16), paddingTop: verticalScale(12) },
  detailSection: { backgroundColor: '#FFFFFF', borderRadius: scale(12), padding: scale(12), marginBottom: verticalScale(10), borderWidth: 1, borderColor: '#E2E8F0' },
  detailTitle: { fontSize: moderateScale(13), fontWeight: '700', color: '#0F172A', marginBottom: verticalScale(8) },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: verticalScale(3) },
  detailLabel: { fontSize: moderateScale(12), color: '#64748B' },
  detailValue: { fontSize: moderateScale(12), color: '#0F172A', fontWeight: '600', flex: 1, textAlign: 'right' },
  detailCustomer: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  detailAvatar: { width: scale(38), height: scale(38), borderRadius: scale(19), backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  detailName: { fontSize: moderateScale(14), fontWeight: '700', color: '#0F172A' },
  detailEmail: { fontSize: moderateScale(11), color: '#64748B', marginTop: verticalScale(2) },
  detailActions: { flexDirection: 'row', gap: scale(10), marginTop: verticalScale(6) },
  btn: { flex: 1, height: verticalScale(42), borderRadius: scale(12), alignItems: 'center', justifyContent: 'center' },
  btnConfirm: { backgroundColor: '#0D9488' },
  btnCancel: { backgroundColor: '#DC2626' },
  btnText: { fontSize: moderateScale(13), fontWeight: '800', color: '#FFFFFF' },
})
