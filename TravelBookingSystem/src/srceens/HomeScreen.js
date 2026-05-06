import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import CategoryChips from "../components/CategoryChips";
import PlaceSection from "../components/PlaceSection";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import usePullRefresh from "../../hooks/usePullRefresh";
import { fetchCategories, fetchPlaces } from "../api/services";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);

  const { user } = useAuth();
  const onPressPlace = (place) => {
    navigation.navigate("ItemDetail", { placeId: place?.id });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };

  useEffect(() => {
    const init = async () => {
      const categories = await fetchCategories();
      setCategories(categories);
      const places = await fetchPlaces();
      setPlaces(places);
    };
    init();
  }, []);
  const { refreshControl } = usePullRefresh(async () => {
    const [categories, places] = await Promise.all([
      fetchCategories(),
      fetchPlaces(),
    ]);
    setCategories(categories);
    setPlaces(places);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <AppHeader title={`Hello, ${user?.first_name ?? "Guest"}`} />
        <SearchBar placeholder="Search for a destination" />
        <PromoBanner />
        <CategoryChips
          categories={categories}
          onChipPress={handleCategoryPress}
        />
        <PlaceSection
          title="Nearby Places"
          places={places}
          onPress={onPressPlace}
        />
        <PlaceSection
          title="Recommended For You"
          places={places}
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
