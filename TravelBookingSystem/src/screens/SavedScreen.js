import React,{ useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CategoryChips from "../components/CategoryChips";
import ItemCardSave from "../components/ItemCardSave";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";
import usePullRefresh from "../../hooks/usePullRefresh";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchWishListItems } from "../api/services";


const categories = ["All", "Tour", "Hotel", "Transport"];

const SavedScreen = () => {
  const { refreshControl } = usePullRefresh(refetch);

  const navigation = useNavigation();

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", 
      {
         itemId: item.id,
         type:"tour",});
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const { token } = useAuth();

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return savedItems;
    if (activeCategory === "Tour") return savedItems;
    return [];
  }, [activeCategory, savedItems]);

  const {
    data: savedItems = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["wishlistItems", token],
    queryFn: () => fetchWishListItems({ token }),
    enabled: Boolean(token),
  })

  if (isLoading) {
    return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.stateText}>Äang táº£i danh sÃ¡ch Ä‘Ã£ lÆ°u...</Text>
      </View>
    </SafeAreaView>
    );
  }

  if (isError) {
    return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>KhÃ´ng thá»ƒ táº£i wishlist.</Text>
        <Pressable style={styles.primaryButton} onPress={refetch}>
          <Text style={styles.primaryButtonText}>Thá»­ láº¡i</Text>
        </Pressable>
      </View>
    </SafeAreaView>
    );
  }

  if (savedItems.length === 0) {
    return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>Báº¡n chÆ°a cÃ³ Ä‘á»‹a Ä‘iá»ƒm Ä‘Ã£ lÆ°u.</Text>
        <Button title="Äi KhÃ¡m PhÃ¡" onPress={() => navigation.navigate("MainTabs", { screen: "HomeFeed", params: { screen: "Home" }, })} />
      </View>
    </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.content} >
        <CategoryChips
              items={categories}
              onChipPress={(category) => setActiveCategory(String(category))}
            />

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ItemCardSave item={item} onPress={() => onPressItem(item)} />
              )}
              refreshControl={refreshControl}
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
  },
  stateTitle: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
  },
});
