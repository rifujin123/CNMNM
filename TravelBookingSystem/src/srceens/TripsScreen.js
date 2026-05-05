import React from "react";
import { StyleSheet, Text, View, StatusBar, FlatList, Button } from "react-native";
import AppHeader from "../components/AppHeader";
import { scale } from "react-native-size-matters";
import { useState, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TripChips from "../components/TripChips";
import { useNavigation } from "@react-navigation/native";




const TripsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Trip" />

      <View style={styles.content}>
        <Button title="Mọi đơn đặt chỗ" onPress={() => navigation.navigate("TripDetail")} />

        <View style={styles.textNoTrip}>
          <Text style={styles.textNoTripTitle}>Chưa Có Đơn, Chưa Có Chuyến Đi!</Text>
          <Text style={styles.textNoTripContent}>Khi quý khách tạo bất kỳ đơn nào, chúng tôi sẽ tạo chuyến đi tại đây để quý khách có thể lên kế hoạch và quản lý hành trình của mình.</Text>
          <Button title="Đi Khám Phá" onPress={() => navigation.navigate("Home")} />
        </View>
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
