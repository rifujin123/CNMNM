import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styles } from "./itemDetailStyles";

export default function DetailState({ isLoading, serviceLabel, onGoBack }) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.mutedText}>Loading {serviceLabel.toLowerCase()}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Cannot load {serviceLabel.toLowerCase()} detail</Text>
      <Pressable style={styles.secondaryButton} onPress={onGoBack}>
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}
