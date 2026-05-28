import { Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./itemDetailStyles";

export default function ItemDetailHeader({
  place,
  serviceLabel,
  locationLabel,
  onOpenRatings,
}) {
  return (
    <>
      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.location}>{locationLabel}</Text>

      <TouchableOpacity style={styles.ratingRow} onPress={onOpenRatings}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={styles.ratingText}>
          {place.star_rating || "N/A"} - {serviceLabel}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>
        {place.description || "No description available."}
      </Text>
    </>
  );
}
