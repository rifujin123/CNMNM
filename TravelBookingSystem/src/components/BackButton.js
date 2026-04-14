import { StyleSheet, Text, Touchable, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { s } from 'react-native-size-matters'
import Entypo from '@expo/vector-icons/Entypo';

const BackButton = () => {
    return (
        <TouchableOpacity style={styles.container}>
            <Entypo name="chevron-left" size={s(16)} color="black" />
        </TouchableOpacity>
    )
}

export default BackButton

const styles = StyleSheet.create({
    container: {
        height: s(32),
        width: s(32),
        borderRadius: s(16),
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
    }
})