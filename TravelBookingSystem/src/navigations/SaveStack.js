import React from "react";
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
import CategoryChips from "../components/CategoryChips";
import ItemCardSave from "../components/ItemCardSave";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";
import usePullRefresh from "../../hooks/usePullRefresh";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useWishlistItems } from "../hooks/useWishlist";

const categories = ["All", "Tour"];

const SavedScreen = () => {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();

  const {
    data: savedItems = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWishlistItems();

  const { refreshControl } = usePullRefresh(refetch);

  const goToLogin = () => {
    navigation.getParent()?.getParent()?.navigate("Login");
  };

  const goToHome = () => {
    navigation.getParent()?.navigate("HomeFeed", {
      screen: "Home",
    });
  };

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", {
      itemId: item.id,
      type: "tour",
    });
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Saved" />

        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Sign in to view saved tours</Text>
          <Text style={styles.stateText}>
            Save your favorite tours and come back to them anytime.
          </Text>

          <Pressable style={styles.primaryButton} onPress={goToLogin}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Saved" />

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.stateText}>Loading saved tours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Saved" />

        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Cannot load wishlist.</Text>
          <Text style={styles.stateText}>
            Please check your connection and try again.
          </Text>

          <Pressable style={styles.primaryButton} onPress={refetch}>
            <Text style={styles.primaryButtonText}>
              {isRefetching ? "Retrying..." : "Try Again"}
            </Text>
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
          <Text style={styles.stateTitle}>No saved tours yet.</Text>
          <Text style={styles.stateText}>
            Tap the heart icon on a tour to save it here.
          </Text>

          <Button title="Explore Now" onPress={goToHome} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Saved" />

      <View style={styles.content}>
        <CategoryChips items={categories} />

        <FlatList
          data={savedItems}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          renderItem={({ item }) => (
            <ItemCardSave item={item} onPress={() => onPressItem(item)} />
          )}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
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
    flex: 1,
    flexDirection: "column",
    gap: scale(16),
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    paddingHorizontal: scale(12),
  },
  stateTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: scale(8),
    minWidth: scale(130),
    height: scale(46),
    borderRadius: scale(14),
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(18),
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});