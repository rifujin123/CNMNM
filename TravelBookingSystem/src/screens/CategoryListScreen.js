import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { StyleSheet, Text, Pressable, FlatList, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ItemListCard from "../components/ItemListCard";
import { useAuth } from "../../context/AuthContext";
import useWishlist from "../hooks/useWishlist";
import { fetchHotels, fetchPlaces, fetchTransports } from "../api/services";

export default function CategoryListScreen({ route, navigation }) {
  const { category } = route.params ?? {};
  const { token } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transports, setTransports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAll = category?.id === "all" || category?.name === "All";
  const categoryId = isAll ? undefined : category?.id;

  const params = categoryId ? { category: categoryId } : {};

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [tourData, hotelData, transportData] = await Promise.all([
          fetchPlaces(params),
          fetchHotels(params),
          fetchTransports(params),
        ]);

        if (active) {
          setTours(tourData);
          setHotels(hotelData);
          setTransports(transportData);
        }
      } catch (err) {
        console.error("Category services fetch error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [categoryId]);

  const allItems = useMemo(
    () => [...tours, ...hotels, ...transports],
    [tours, hotels, transports]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Text>
            {" "}
            <Ionicons name="filter" size={24} color="black" />
          </Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", { ItemId: item?.id, serviceType: item?.type });
  };

  const onRequireLogin = () => {
    navigation.navigate("AccountNotLoggedInScreen");
  };

  const handleWishlistToggle = (item) => {
    toggleWishlist(item);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        data={allItems}
        keyExtractor={(item, index) => `${item?.type ?? "service"}-${item?.id ?? index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ItemListCard
            item={item}
            onPress={() => onPressItem(item)}
            isWishlist={isWishlisted(item?.id)}
            onWishlistToggle={token ? handleWishlistToggle : undefined}
            onRequireLogin={onRequireLogin}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="small" color="#0F172A" />
              <Text style={styles.emptyText}>Loading services...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services available</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#78716C",
  },
});
