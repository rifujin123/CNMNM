import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import ItemSection from "../components/ItemSection";
import CategoryChips from "../components/CategoryChips";
import { useNavigation } from "@react-navigation/native";
import usePullRefresh from "../../hooks/usePullRefresh";
import useWishlist from "../hooks/useWishlist";
import { useCategories, useHotels, usePlaces, useTransports } from "../hooks/useTours";
import { useAuth } from "../../context/AuthContext";

const ExploreScreen = () => {
  const { data: places = [], refetch: refetchPlaces } = usePlaces();
  const { data: hotels = [], refetch: refetchHotels } = useHotels();
  const { data: transports = [], refetch: refetchTransports } = useTransports();
  const { data: categories = [], refetch: refetchCategories } = useCategories();
  const navigation = useNavigation();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const { token } = useAuth();

  const onRequireLogin = () => {
    navigation.navigate("AccountNotLoggedInScreen");
  };

  const { refreshControl } = usePullRefresh(() =>
    Promise.all([
      refetchCategories(),
      refetchPlaces(),
      refetchHotels(),
      refetchTransports(),
    ])
  );

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", {
      ItemId: item?.id,
      serviceType: item?.type,
    });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
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
          isWishlisted={isWishlisted}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
          onSeeAllPress={() =>
            navigation.navigate("SeeAll", {
              title: "Recommended For You",
              items: places,
            })
          }
        />
        <ItemSection
          title="Hotels"
          items={hotels}
          onPress={onPressItem}
          isWishlisted={isWishlisted}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
          onSeeAllPress={() =>
            navigation.navigate("SeeAll", {
              title: "Hotels",
              items: hotels,
            })
          }
        />
        <ItemSection
          title="Transport"
          items={transports}
          onPress={onPressItem}
          isWishlisted={isWishlisted}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
          onSeeAllPress={() =>
            navigation.navigate("SeeAll", {
              title: "Transport",
              items: transports,
            })
          }
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
