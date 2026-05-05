import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CategoryChips from "../components/CategoryChips";
import PlaceCardSave from "../components/PlaceCardSave";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";

const DATA = [
  {
    id: "1",
    title: "Ha Long Bay",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89ea2641838?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    location: "Quang Ninh, Vietnam",
    price: "$100",
    rating: "4.5",
    description:
      "Ha Long Bay is a UNESCO World Heritage Site located in Quang Ninh province, Vietnam. It is known for its stunning limestone karsts and islands.",
  },
  {
    id: "2",
    title: "Hoi An Ancient Town",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89ea2641838?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    location: "Quang Nam, Vietnam",
    price: "$100",
    rating: "4.5",
    description:
      "Hoi An Ancient Town is a UNESCO World Heritage Site located in Quang Nam province, Vietnam. It is known for its stunning limestone karsts and islands.",
  },
  {
    id: "3",
    title: "Da Lat City",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89ea2641838?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    location: "Lam Dong, Vietnam",
    price: "$100",
    rating: "4.5",
    description:
      "Da Lat City is a UNESCO World Heritage Site located in Lam Dong province, Vietnam. It is known for its stunning limestone karsts and islands.",
  },
];
const categories = ["All", "Tour", "Hotel", "Transport"];

const SavedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.content} >
        <CategoryChips items={categories} />
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaceCardSave
              place={{
                title: item.title,
                location: item.location,
                image: item.image,
                price: item.price,
                rating: item.rating,
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: scale(20),
    marginTop: StatusBar.currentHeight || 0,
  },
  content: {
    flexDirection: "column",
    gap: scale(16)
  }
});
