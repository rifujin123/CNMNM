import React from "react";
import {View,Text,StyleSheet,TouchableOpacity,} from "react-native";
import {scale,verticalScale,} from "react-native-size-matters";

const getLabel = (item) => {
  if (item === "upcoming") return "Upcoming";
  if (item === "completed") return "Completed";
  if (item === "cancelled") return "Cancelled";
  return item;
};

export default function TripChips({ items , activeIndex = 0 , onChange ,}) {
    return (
        <View style={styles.container}>
            {items.map((item, idx) => {
                const active = idx === activeIndex;

                return (
                    <TouchableOpacity key={item} style={styles.tab} activeOpacity={0.8} onPress={() => onChange(idx)}>
                        <Text style={[styles.text, active && styles.activeText]}>
                            {getLabel(item)}
                        </Text>

                        {active && <View style={styles.activeLine} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {height: verticalScale(40),flexDirection: "row",borderBottomWidth: 1,borderBottomColor: "#CBD5E1",},
    tab: {flex: 1,justifyContent: "center",alignItems: "center",position: "relative",},
    text: {fontSize: scale(12),fontWeight: "500",color: "#64748B",},
    activeText: {color: "#2563EB",},
    activeLine: {position: "absolute",bottom: 0,width: "100%",height: verticalScale(4),backgroundColor: "#2563EB",borderTopLeftRadius: scale(4),borderTopRightRadius: scale(4),},
});