import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import PlaceCard from "../components/PlaceCard";

export default function PlaceSection({
  title = "Recommended For You",
  places = [],
  onSeeAllPress,
  onPress,
  renderCard,
  slidingCard = false,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>

        <Pressable onPress={onSeeAllPress} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={places}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={({ item }) =>
          renderCard ? (
            renderCard(item)
          ) : (
            <PlaceCard place={item} onPress={() => onPress?.(item)} />
          )
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate={slidingCard ? "fast" : "normal"}
        snapToInterval={slidingCard ? 182 : undefined}
        snapToAlignment={slidingCard ? "start" : undefined}
        disableIntervalMomentum={slidingCard}
        ListEmptyComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAll: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "500",
    color: "#2563EB",
  },
  listContent: {
    marginTop: 10,
    paddingRight: 24,
  },
});
