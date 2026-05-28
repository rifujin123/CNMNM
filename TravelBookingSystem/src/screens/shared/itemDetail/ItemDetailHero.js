import { Image, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./itemDetailStyles";

export default function ItemDetailHero({ imageUri, onBack }) {
  return (
    <>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>
    </>
  );
}
