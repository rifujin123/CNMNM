import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'

const CategoryFilterChips = ({ onFilterChange, activeFilter }) => {
    const [internalSelected, setInternalSelected] = useState('all')
    const selected = activeFilter !== undefined ? activeFilter : internalSelected

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'tour', label: 'Tour' },
        { id: 'hotel', label: 'Hotel' },
        { id: 'transport', label: 'Transport' },
    ]

    const handlePress = (id) => {
        if (activeFilter === undefined) setInternalSelected(id)
        onFilterChange?.(id)
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
        >
            {categories.map((cat) => (
                <Pressable
                    key={cat.id}
                    style={[
                        styles.chip,
                        selected === cat.id && styles.chipActive,
                    ]}
                    onPress={() => handlePress(cat.id)}
                >
                    <Text
                        style={[
                            styles.chipText,
                            selected === cat.id && styles.chipTextActive,
                        ]}
                    >
                        {cat.label}
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    )
}

export default CategoryFilterChips

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 8,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 9,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: '#1F2937',
        borderColor: '#1F2937',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
})