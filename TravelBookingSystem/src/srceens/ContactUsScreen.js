import { StyleSheet, Text, View } from "react-native";
import React from "react";
import UserAvatar from "../components/UserAvatar";
import NotiButton from "../components/NotiButton";
import { vs } from "react-native-size-matters";
import Section from "../components/Section";
const ContactUsScreen = () => {
    return (
        <View style={{ flex: 1, marginTop: vs(50), paddingHorizontal: 17 }}>
            <View style={styles.header}>
                <UserAvatar />
                <NotiButton />
            </View>
            <View style={styles.body}>
                <Section />
                <Section />
                <Section />
                <Section />
                <Section />
            </View>
        </View>
    );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    body: {
        justifyContent: "center",
        flex: 1,
    },
});
