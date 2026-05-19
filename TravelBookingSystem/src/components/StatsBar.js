import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const StatsBar = ({ active = 0, inactive = 0, total = 0 }) => {
    return (
        <View style={styles.container}>
            <View style={[styles.pill, styles.activePill]}>
                <Text style={styles.valueText}>{active}</Text>
                <Text style={styles.labelText}>Active</Text>
            </View>

            <View style={[styles.pill, styles.inactivePill]}>
                <Text style={styles.valueText}>{inactive}</Text>
                <Text style={styles.labelText}>Inactive</Text>
            </View>

            <View style={[styles.pill, styles.totalPill]}>
                <Text style={[styles.valueText, styles.darkText]}>{total}</Text>
                <Text style={[styles.labelText, styles.darkText]}>Total</Text>
            </View>
        </View>
    )
}

export default StatsBar

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        gap: 14,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 50,
    },
    activePill: {
        backgroundColor: '#10B981',
    },
    inactivePill: {
        backgroundColor: '#EF4444',
    },
    totalPill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 4, // Cách label một chút bên phải
    },
    labelText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    darkText: {
        color: '#1E293B', // Chữ tối cho pill trắng
    }
})