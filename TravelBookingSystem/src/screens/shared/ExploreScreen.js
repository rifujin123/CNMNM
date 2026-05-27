import React, { useState, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/SearchBar";
import ItemSection from "../../components/ItemSection";
import CategoryChips from "../../components/CategoryChips";
import { useNavigation } from "@react-navigation/native";
import usePullRefresh from "../../../hooks/usePullRefresh";
import useWishlist from "../../hooks/useWishlist";
import { useAuth } from "../../../context/AuthContext";
import { fetchCategories, fetchPlaces, fetchHotels, fetchTransports } from "../../api/services";
import { commonStyles as styles } from "../../styles/commonStyles";

const ExploreScreen = () => {
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transports, setTransports] = useState([]);
  const navigation = useNavigation();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { token } = useAuth();

  const onRequireLogin = () => {
    navigation.navigate("Login");
  };

  const loadData = useCallback(async () => {
    const [cats, pls, htls, trns] = await Promise.all([
      fetchCategories(),
      fetchPlaces(),
      fetchHotels(),
      fetchTransports(),
    ]);
    setCategories(cats);
    setPlaces(pls);
    setHotels(htls);
    setTransports(trns);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { refreshControl } = usePullRefresh(loadData);

  const onPressItem = (item) => {
    const serviceType = item?.type || item?.service_type || "tour";
    navigation.navigate("ItemDetail", {
      itemId: item?.id,
      serviceType,
    });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };

  return (
    <SafeAreaView style={styles.tabScreen}>
      <ScrollView
        style={styles.tabContent}
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

