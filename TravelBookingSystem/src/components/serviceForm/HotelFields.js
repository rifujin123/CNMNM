import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HotelFields = ({
  formData,
  updateField,
  updateRoomType,
  addRoomType,
  removeRoomType,
  updateRoom,
  addRoom,
  removeRoom,
}) => (
  <View>
    <View style={styles.field}>
      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="Street, district..."
        value={formData.address_detail}
        onChangeText={(val) => updateField('address_detail', val)}
      />
    </View>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Room Types *</Text>
      <TouchableOpacity style={styles.iconButton} onPress={addRoomType}>
        <Ionicons name="add" size={18} color="#0D9488" />
      </TouchableOpacity>
    </View>

    {formData.room_types.map((roomType, roomTypeIndex) => (
      <View key={`room-type-${roomTypeIndex}`} style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Room type {roomTypeIndex + 1}</Text>
          {formData.room_types.length > 1 && (
            <TouchableOpacity onPress={() => removeRoomType(roomTypeIndex)}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Deluxe"
            value={roomType.name}
            onChangeText={(val) => updateRoomType(roomTypeIndex, 'name', val)}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Price"
            value={roomType.price}
            onChangeText={(val) => updateRoomType(roomTypeIndex, 'price', val)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.roomsHeader}>
          <Text style={styles.subTitle}>Rooms</Text>
          <TouchableOpacity style={styles.textButton} onPress={() => addRoom(roomTypeIndex)}>
            <Ionicons name="add" size={16} color="#0D9488" />
            <Text style={styles.textButtonLabel}>Add room</Text>
          </TouchableOpacity>
        </View>

        {roomType.rooms.map((room, roomIndex) => (
          <View key={`room-${roomTypeIndex}-${roomIndex}`} style={styles.roomRow}>
            <TextInput
              style={[styles.input, styles.roomNumberInput]}
              placeholder="D101"
              value={room.room_number}
              onChangeText={(val) => updateRoom(roomTypeIndex, roomIndex, 'room_number', val)}
            />
            <TextInput
              style={[styles.input, styles.bedsInput]}
              placeholder="Beds"
              value={String(room.total_beds ?? '')}
              onChangeText={(val) => updateRoom(roomTypeIndex, roomIndex, 'total_beds', val)}
              keyboardType="numeric"
            />
            {roomType.rooms.length > 1 && (
              <TouchableOpacity
                style={styles.removeRoomButton}
                onPress={() => removeRoom(roomTypeIndex, roomIndex)}
              >
                <Ionicons name="close" size={18} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1C1917' },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
  },
  group: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FAFAF9',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitle: { fontSize: 13, fontWeight: '700', color: '#44403C' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  rowInput: { flex: 1 },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subTitle: { fontSize: 12, fontWeight: '700', color: '#57534E' },
  textButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textButtonLabel: { fontSize: 12, fontWeight: '700', color: '#0D9488' },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roomNumberInput: { flex: 1.2 },
  bedsInput: { flex: 0.8 },
  removeRoomButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
});

export default HotelFields;
