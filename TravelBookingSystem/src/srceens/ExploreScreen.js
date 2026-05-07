import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import ItemSection from "../components/ItemSection";
import CategoryChips from "../components/CategoryChips";
import HotelCard from "../components/HotelCard";
import TransportCard from "../components/TransportCard";
import { useState, useEffect } from "react";
import { fetchCategories, fetchPlaces } from "../api/services";
import { useNavigation } from "@react-navigation/native";

const places = [
  { id: "1", name: "Bali Beach", meta: "4.8 ★  •  2.3 km", color: "#93C5FD" },
  {
    id: "2",
    name: "Mountain View",
    meta: "4.7 ★  •  5.1 km",
    color: "#86EFAC",
  },
  { id: "3", name: "Bali Beach", meta: "4.8 ★  •  2.3 km", color: "#93C5FD" },
];

const hotels = [
  {
    id: "h1",
    name: "Sea Breeze Hotel",
    meta: "4.8 ★  •  Near beach",
    color: "#BAE6FD",
    price: "From $110 / night",
  },
  {
    id: "h2",
    name: "Mountain Lodge",
    meta: "4.6 ★  •  Breakfast included",
    color: "#CFFAFE",
    price: "From $92 / night",
  },
  {
    id: "h3",
    name: "City Boutique",
    meta: "4.7 ★  •  Central district",
    color: "#A5F3FC",
    price: "From $135 / night",
  },
];

const transports = [
  {
    id: "t1",
    name: "Airport Shuttle",
    meta: "Every 30 mins",
    color: "#BBF7D0",
    price: "From $8 / seat",
  },
  {
    id: "t2",
    name: "Private Car",
    meta: "With driver",
    color: "#DCFCE7",
    price: "From $25 / trip",
  },
  {
    id: "t3",
    name: "City Bus Pass",
    meta: "Unlimited rides",
    color: "#86EFAC",
    price: "From $5 / day",
  },
];

const ExploreScreen = () => {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      const categories = await fetchCategories();
      setCategories(categories);
      const places = await fetchPlaces();
      setPlaces(places);
    };
    init();
  }, []);

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", { ItemId: item?.id });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Explore" />
        <SearchBar placeholder="Search cities, places, hotels" />
        <CategoryChips
          categories={categories}
          onChipPress={handleCategoryPress}
        />
        <ItemSection
          title="Recommended For You"
          items={places}
          onPress={onPressItem}
        />
        <ItemSection
          title="Hotels"
          items={hotels}
          onPress={onPressItem}
          renderCard={(hotel) => <HotelCard hotel={hotel} />}
        />
        <ItemSection
          title="Transport"
          items={transports}
          onPress={onPressItem}
          renderCard={(transport) => <TransportCard transport={transport} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
