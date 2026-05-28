import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatMoneyOrNA } from "../../../utils/format";
import { tokens } from "../../../styles/commonStyles";
import { styles } from "./itemDetailStyles";

export default function TourOptions({ packages, selectedPackageId, onSelectPackage }) {
  return (
    <>
      <Text style={styles.sectionTitle}>Choose package</Text>

      {packages.length > 0 ? (
        packages.map((pkg) => {
          const isSelected = String(pkg.id) === String(selectedPackageId);

          return (
            <Pressable
              key={pkg.id}
              onPress={() => onSelectPackage(pkg.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{pkg.name}</Text>
                  <Text style={styles.optionSubText}>
                    Package price: {formatMoneyOrNA(pkg.price)}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? tokens.colors.primary : tokens.colors.iconMuted}
                />
              </View>

              <Text style={styles.optionPrice}>
                Total: {formatMoneyOrNA(pkg.total_price)}
              </Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No packages available.</Text>
      )}
    </>
  );
}
