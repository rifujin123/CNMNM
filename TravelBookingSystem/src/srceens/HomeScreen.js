import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import CategoryChips from "../components/CategoryChips";
import PlaceSection from "../components/PlaceSection";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [placeList, setPlaceList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("auth_user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    loadUser();
  }, []);

  const onPressPlace = (place) => {
    navigation.navigate("ItemDetail", { place });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadPlaces(), loadCategories()]);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };

  useEffect(() => {
    loadPlaces();
    loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AppHeader title={`Hello, ${user?.first_name}`} />
        <SearchBar placeholder="Search for a destination" />
        <PromoBanner />
        <CategoryChips
          categories={categories}
          onChipPress={handleCategoryPress}
        />
        <PlaceSection
          title="Nearby Places"
          places={placeList}
          onPress={onPressPlace}
        />
        <PlaceSection
          title="Recommended For You"
          places={placeList}
          onPress={onPressPlace}
        />
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
