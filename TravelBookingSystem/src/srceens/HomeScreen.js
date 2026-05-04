import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import CategoryChips from "../components/CategoryChips";
import PlaceSection from "../components/PlaceSection";
import Apis, { endpoints } from "../../configs/Apis";

const HomeScreen = () => {
  const [placeList, setPlaceList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const loadCategories = async () => {
    try {
      let url = `${endpoints["categories"]}`;
      let res = await Apis.get(url);
      let items = res?.data ?? [];
      setCategories(items);
    } catch (err) {
      console.log("Error fetching categories:", err.message);
    }
  };

  const loadPlaces = async () => {
    try {
      const url = `${endpoints["tours"]}`;
      const res = await Apis.get(url);
      const items = res?.data ?? [];

      const mappedPlaces = items.map((item, index) => ({
        id: String(item.id),
        name: item.name,
        star_rating: item.star_rating,
        base_price: item.base_price_display,
        city: item.city,
        color: index % 2 === 0 ? "#93C5FD" : "#86EFAC",
      }));

      setPlaceList(mappedPlaces);
    } catch (err) {
      console.log("Error fetching places:", err.message);
      setPlaceList([]);
    }
  };

  useEffect(() => {
    loadPlaces();
    loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Hello, Khoi" />
        <SearchBar placeholder="Search for a destination" />
        <PromoBanner />
        <CategoryChips
          categories={categories}
          activeIndex={activeCategoryIndex}
          onSelect={(category, idx) => setActiveCategoryIndex(idx)}
        />
        <PlaceSection title="Nearby Places" places={placeList} />
        <PlaceSection title="Recommended For You" places={placeList} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
