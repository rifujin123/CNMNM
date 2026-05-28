import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatMoneyOrNA } from "../../../utils/format";
import { tokens } from "../../../styles/commonStyles";
import { styles } from "./itemDetailStyles";

export default function HotelOptions({ rooms, selectedRoomId, onSelectRoom }) {
  return (
    <>
      <Text style={styles.sectionTitle}>Choose room</Text>

      {rooms.length > 0 ? (
        rooms.map((room) => {
          const isSelected = String(room.id) === String(selectedRoomId);
          const roomType = room.room_type;

          return (
            <Pressable
              key={room.id}
              onPress={() => onSelectRoom(room.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>
                    Room {room.room_number || room.id}
                  </Text>
                  <Text style={styles.optionSubText}>
                    {roomType?.name || "Room"} - {room.total_beds || 1} bed(s)
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? tokens.colors.primary : tokens.colors.iconMuted}
                />
              </View>

              <Text style={styles.optionPrice}>{formatMoneyOrNA(roomType?.price)}</Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No rooms available.</Text>
      )}
    </>
  );
}
