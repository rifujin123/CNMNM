import React, { useMemo, useState } from "react";
import {ActivityIndicator,FlatList,Pressable,StatusBar,StyleSheet,Text,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryFilterChips from "../../components/CategoryFilterChips";
import ItemListCard from "../../components/ItemListCard";
import AppHeader from "../../components/AppHeader";
import { scale } from "react-native-size-matters";
import usePullRefresh from "../../hooks/usePullRefresh";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import { useWishlist } from "../../../context/WishlistContext";
import GuestHero from "../../components/GuestHero";


const SavedScreen = () => {
  const navigation = useNavigation();
  const { isLoggedIn, token } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const {
    savedItems = [],
    isLoading,
    refetch,
    isWishlisted,
    toggleWishlist,
  } = useWishlist();
  
  const { refreshControl } = usePullRefresh(refetch);
  
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return savedItems;
    return savedItems.filter(
      (item) => String(item?.type || "").toLowerCase() === activeFilter
    );
  }, [activeFilter, savedItems]);

  const onPressItem = (item) => {
    const serviceType = item?.type || item?.service_type || "tour";
    navigation.navigate("ItemDetail", {
      itemId: item?.id,
      serviceType,
    });
  };

  const onRequireLogin = () => {
    navigation.navigate("Login");
  };

  const handleWishlistToggle = (item) => {
    toggleWishlist(item);
  };

  const goToHome = () => {
    navigation.getParent()?.navigate("HomeFeed", {
      screen: "Home",
    });
  };

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
      <View style={styles.guestWrapper}>
        <GuestHero onLoginPress={goToLogin} />
      </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Saved" />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading saved services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />
        <View style={styles.savedFilterWrapper}>
          {savedItems.length > 0 && (
            <CategoryFilterChips 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}/>
            )}
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => `${item?.type ?? "service"}-${item?.id ?? index}`}
          renderItem={({ item }) => (
            <ItemListCard
              item={item}
              onPress={() => onPressItem(item)}
              isWishlist={isWishlisted(item?.id)}
              onWishlistToggle={token ? handleWishlistToggle : undefined}
              onRequireLogin={onRequireLogin}
            />
          )}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No saved services yet</Text>
              <Text style={styles.emptySubtext}>Tap the heart icon on a tour, hotel, or transport to keep it here.</Text>
              <Pressable style={styles.primaryButton} onPress={goToHome}>
                <Text style={styles.primaryButtonText}>Explore Now</Text>
              </Pressable>
            </View>
          }/>
    </SafeAreaView>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#F8FAFC",paddingHorizontal: scale(20),marginTop: StatusBar.currentHeight || 0,},
  listContent: {paddingBottom: scale(24),},
  centerState: {flex: 1,alignItems: "center",justifyContent: "center",gap: scale(10),paddingHorizontal: scale(16),},
  stateText: {fontSize: 14,lineHeight: 20,color: "#64748B",textAlign: "center",},
  primaryButton: {marginTop: scale(8),minWidth: scale(140),height: scale(46),borderRadius: scale(14),backgroundColor: "#2563EB",alignItems: "center",justifyContent: "center",paddingHorizontal: scale(18),},
  primaryButtonText: {fontSize: 14,fontWeight: "800",color: "#FFFFFF",},
  emptyContainer: {alignItems: "center",justifyContent: "center",paddingTop: 80,gap: 10,},
  emptyText: {fontSize: 16,color: "#78716C",fontWeight: "600",},
  emptySubtext: {fontSize: 14,color: "#78716C",textAlign: "center",},
  savedFilterWrapper:{marginTop: scale(4),marginBottom: scale(4),paddingHorizontal: scale(2),},
  guestWrapper: {flex: 1,justifyContent: "center",paddingHorizontal: scale(4),},
});
