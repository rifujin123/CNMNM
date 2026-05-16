import React from "react";
import { StyleSheet, Text, View, StatusBar, FlatList, Button } from "react-native";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";
import { useState, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TripSumaryCard from "../components/TripSumaryCard";

const tripSummaries = [
  {
    id: "1",
    title: "Ho Chi Minh City",
    image: "https://cdn.pixabay.com/photo/2017/11/11/19/59/city-2940500_1280.jpg",
  },
];



const TripsScreen = () => {
  const navigation = useNavigation();

  const hasTrips = tripSummaries.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Trip" />

      <View style={styles.content}>
        <Button title="All Bookings" onPress={() => navigation.navigate("TripDetail")} />


        {hasTrips ? (tripSummaries.map((item) => (
          <TripSumaryCard
            key={item.id}
            trip={item}
            onPress={() => navigation.navigate("TripDetail")}
          />
        ))) : (
          <View style={styles.textNoTrip}>
            <Text style={styles.textNoTripTitle}>No Bookings, No Trips Yet!</Text>
            <Text style={styles.textNoTripContent}>When you create any booking, we will create a trip here so you can plan and manage your journey.</Text>
            <Button title="Explore Now" onPress={() => navigation.navigate("MainTabs", { screen: "HomeFeed", params: { screen: "Home" }, })} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TripsScreen;

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
  textNoTrip: {
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    marginTop: scale(150)
  },
  textNoTripTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  textNoTripContent: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: "#0F172A",
    textAlign: "center",
  }
});
