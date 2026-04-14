import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import TravelLogo from "../assets/TravelLogo";
import TopLeftBlobs from "../assets/TopLeftBlobs";
import RightTopPills from "../assets/RightTopPills";
import BottomRightBlobs from "../assets/BottomRightBlobs";
import BottomLeftDots from "../assets/BottomLeftDots";
const IntroScreen = () => {
  return (
    <View style={styles.container}>
      <BottomRightBlobs style={styles.bottomRightBlobs} />
      <TopLeftBlobs style={styles.topLeftBlobs} />
      <RightTopPills style={styles.rightTopPills} />
      <BottomLeftDots style={styles.bottomLeftDots} />
      <TravelLogo />
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRightBlobs: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  topLeftBlobs: {
    position: "absolute",
    top: 0,
    left: -15,
  },
  rightTopPills: {
    position: "absolute",
    top: "25%",
    right: "-10%",
  },
  bottomLeftDots: {
    position: "absolute",
    bottom: 60,
    left: 30,
  },
});
