import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDateTime, formatMoneyOrNA, getRouteLabel, toNumber } from "../../../utils/format";
import { tokens } from "../../../styles/commonStyles";
import { styles } from "./itemDetailStyles";

export default function TransportOptions({
  routes,
  selectedRoute,
  selectedRouteId,
  selectedSeatTypeId,
  seatTypeOptions,
  basePrice,
  onSelectRoute,
  onSelectSeatType,
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>Choose route</Text>

      {routes.length > 0 ? (
        routes.map((item) => {
          const isSelected = String(item.id) === String(selectedRouteId);

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectRoute(item.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{getRouteLabel(item)}</Text>
                  <Text style={styles.optionSubText}>
                    Depart: {formatDateTime(item.departure_time)}
                  </Text>
                  <Text style={styles.optionSubText}>
                    Arrive: {formatDateTime(item.arrival_time)}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? tokens.colors.primary : tokens.colors.iconMuted}
                />
              </View>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No routes available.</Text>
      )}

      <Text style={styles.sectionTitle}>Choose seat type</Text>

      {seatTypeOptions.length > 0 ? (
        seatTypeOptions.map((seatType) => {
          const isSelected = String(seatType.id) === String(selectedSeatTypeId);
          const isUnavailable = !selectedRoute || seatType.availableSeats <= 0;

          return (
            <Pressable
              key={seatType.id}
              disabled={isUnavailable}
              onPress={() => onSelectSeatType(seatType.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                isUnavailable && styles.optionCardDisabled,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{seatType.name}</Text>
                  <Text style={styles.optionSubText}>
                    {seatType.availableSeats} seat(s) available
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? tokens.colors.primary : tokens.colors.iconMuted}
                />
              </View>

              <Text style={styles.optionPrice}>
                {formatMoneyOrNA(toNumber(basePrice) + toNumber(seatType.price))}
              </Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No seat types available.</Text>
      )}
    </>
  );
}