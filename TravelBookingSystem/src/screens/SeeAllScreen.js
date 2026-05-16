import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ItemListCard from "../components/ItemListCard";
import { useAuth } from "../../context/AuthContext";
import useWishlist from "../hooks/useWishlist";

export default function SeeAllScreen({ route }) {
  const { title = "All Tours", items = [] } = route.params ?? {};
  const navigation = useNavigation();
  const { token } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const onPressItem = (item) => {
    navigation.navigate("ItemDetail", { ItemId: item?.id });
  };

  const onRequireLogin = () => {
    navigation.navigate("AccountNotLoggedInScreen");
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      numColumns={1}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <ItemListCard
          item={item}
          onPress={() => onPressItem(item)}
          isWishlist={isWishlisted(item?.id)}
          onWishlistToggle={token ? toggleWishlist : undefined}
          onRequireLogin={onRequireLogin}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tours available</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#78716C",
  },
});
