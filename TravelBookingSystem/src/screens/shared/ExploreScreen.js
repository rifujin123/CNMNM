import React, { useState, useEffect, useCallback } from "react";
import { FlatList, Text, StyleSheet } from "react-native";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/SearchBar";
import ItemListCard from "../../components/ItemListCard";
import { useNavigation } from "@react-navigation/native";
import usePullRefresh from "../../hooks/usePullRefresh";
import useWishlist from "../../hooks/useWishlist";
import { useAuth } from "../../../context/AuthContext";
import { fetchPlaces, fetchHotels, fetchTransports } from "../../api/services";
import { commonStyles } from "../../styles/commonStyles";

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigation = useNavigation();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { token } = useAuth();

  const onRequireLogin = () => {
    navigation.navigate("Login");
  };

  const loadData = useCallback(async () => {
    const query = searchQuery.trim();

    if (!query) {
      setResults([]);
      return;
    }

    const params = { q: query };
    const [places, hotels, transports] = await Promise.all([
      fetchPlaces(params),
      fetchHotels(params),
      fetchTransports(params),
    ]);

    setResults([...places, ...hotels, ...transports]);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {

      loadData();
    }, 500);
    return () => clearTimeout(timeout);
  }, [loadData]);

  const { refreshControl } = usePullRefresh(loadData);

  const onPressItem = (item) => {
    const serviceType = item?.type || item?.service_type || "tour";
    navigation.navigate("ItemDetail", {
      itemId: item?.id,
      serviceType,
    });
  };

  const renderItem = ({ item }) => (
    <ItemListCard
      item={item}
      onPress={() => onPressItem(item)}
      isWishlist={isWishlisted(item?.id)}
      onWishlistToggle={token ? toggleWishlist : undefined}
      onRequireLogin={onRequireLogin}
    />
  );

  const query = searchQuery.trim();

  return (
    <SafeAreaView style={commonStyles.tabScreen}>
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        refreshControl={refreshControl}
        contentContainerStyle={commonStyles.tabContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppHeader title="Explore" />
            <SearchBar
              placeholder="Search tours, hotels, transport"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {query ? "No results found." : ""}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  emptyText: {
    marginTop: 24,
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
});
