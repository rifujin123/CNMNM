import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { s } from 'react-native-size-matters'
const UserAvatar = () => {
    return (
        <Image
            source={{ uri: 'https://th.bing.com/th/id/OIP.Zs2KmPfVRqr1CrjCQijifwHaFj?w=214&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' }}
            style={styles.avatar}
        />
    )
}

export default UserAvatar

const styles = StyleSheet.create({
    avatar: {
        height: s(52),
        width: s(52),
        borderRadius: s(26),
    }
})