import { Pressable, Text, View } from "react-native";
import { styles } from "./itemDetailStyles";

export default function BottomBookingBar({ selectedPrice, canBook, onBookNow }) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel}>Selected</Text>
        <Text style={styles.priceValue} numberOfLines={1}>
          {selectedPrice}
        </Text>
      </View>

      <Pressable
        disabled={!canBook}
        onPress={onBookNow}
        style={[styles.bookButton, !canBook && styles.bookButtonDisabled]}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </Pressable>
    </View>
  );
}