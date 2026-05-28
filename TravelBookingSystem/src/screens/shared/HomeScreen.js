import React, { useState, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import PromoBanner from "../../components/PromoBanner";
import CategoryChips from "../../components/CategoryChips";
import ItemSection from "../../components/ItemSection";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import usePullRefresh from "../../hooks/usePullRefresh";
import useWishlist from "../../hooks/useWishlist";
import { fetchCategories, fetchPlaces, fetchHotels, fetchTransports } from "../../api/services";
import { commonStyles as styles } from "../../styles/commonStyles";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transports, setTransports] = useState([]);
  const { token, user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const loadData = useCallback(async () => {
    const [cats, pls, hls, tps] = await Promise.all([
      fetchCategories(),
      fetchPlaces(),
      fetchHotels(),
      fetchTransports(),
    ]);
    setCategories(cats);
    setPlaces(pls);
    setHotels(hls);
    setTransports(tps);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPressItem = (item) => {
    const serviceType = item?.type || item?.service_type || "tour";
    navigation.navigate("ItemDetail", { itemId: item?.id, serviceType });
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
        <PromoBanner />
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
          title="Tours"
          items={places}
          onPress={onPressItem}
          isWishlisted={isWishlisted}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
          onSeeAllPress={() =>
            navigation.navigate("SeeAll", {
              title: "Tours",
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

export default HomeScreen;

