import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";

const banners = [
  {
    id: "b1",
    title: "Summer Escape 30% Off",
    sub: "Book your next trip today",
    cta: "Explore now",
    bg: "#2563EB",
  },
  {
    id: "b2",
    title: "Hotel Deals Up To 40%",
    sub: "Best prices for your weekend stay",
    cta: "Book hotels",
    bg: "#0EA5E9",
  },
  {
    id: "b3",
    title: "Airport Transfer Promo",
    sub: "Ride to city center with discount",
    cta: "View rides",
    bg: "#16A34A",
    image: null,
  },
];

export default function PromoBanner() {
  const renderBanner = ({ item }) => (
    <View style={[styles.banner, { backgroundColor: item.bg }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>{item.sub}</Text>

      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>{item.cta}</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      horizontal
      data={banners}
      keyExtractor={(item) => item.id}
      renderItem={renderBanner}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      decelerationRate="fast"
      snapToInterval={308}
      snapToAlignment="start"
      disableIntervalMomentum
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    marginTop: 20,
    paddingRight: 24,
  },
  banner: {
    width: 296,
    height: 192,
    borderRadius: 22,
    padding: 20,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    color: "#FFF",
    fontWeight: "700",
    maxWidth: 240,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: "#DBEAFE",
  },
  cta: {
    marginTop: 18,
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },
});
