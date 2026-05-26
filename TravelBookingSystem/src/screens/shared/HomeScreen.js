import React, { useState, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/SearchBar";
import PromoBanner from "../../components/PromoBanner";
import CategoryChips from "../../components/CategoryChips";
import ItemSection from "../../components/ItemSection";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import usePullRefresh from "../../../hooks/usePullRefresh";
import useWishlist from "../../hooks/useWishlist";
import { fetchCategories, fetchPlaces } from "../../api/services";
import { commonStyles as styles } from "../../styles/commonStyles";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);

  const { token, user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const loadData = useCallback(async () => {
    const [cats, pls] = await Promise.all([
      fetchCategories(),
      fetchPlaces(),
    ]);
    setCategories(cats);
    setPlaces(pls);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", { ItemId: item?.id, serviceType: item?.type});
  };

  const onRequireLogin = () => {
    navigation.navigate("AccountNotLoggedInScreen");
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryList", { category });
  };

  const { refreshControl } = usePullRefresh(loadData);

  return (
    <SafeAreaView style={styles.tabScreen}>
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <AppHeader
          title={`Hello, ${user?.first_name?.trim() || user?.username || "Guest"}`}
        />
        <SearchBar placeholder="Search for a destination" />
        <PromoBanner />
        <CategoryChips
          categories={categories}
          onChipPress={handleCategoryPress}
        />
        <ItemSection
          title="Nearby Places"
          items={places}
          onPress={onPressItem}
          isWishlisted={isWishlisted}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
          onSeeAllPress={() =>
            navigation.navigate("SeeAll", {
              title: "Nearby Places",
              items: places,
            })
          }
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

