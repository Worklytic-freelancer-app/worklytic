import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20 padding di kiri dan kanan

export default function SkeletonServices() {
    return (
        <View style={styles.container}>
            {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.serviceCard}>
                    <Shimmer 
                        width={CARD_WIDTH} 
                        height={200} 
                        style={styles.serviceImage}
                    />
                    <View style={styles.serviceInfo}>
                        <View style={styles.freelancerInfo}>
                            <Shimmer 
                                width={24} 
                                height={24} 
                                borderRadius={12} 
                                style={styles.freelancerThumb}
                            />
                            <Shimmer 
                                width={120} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.freelancerName}
                            />
                        </View>
                        <Shimmer 
                            width={CARD_WIDTH - 32} 
                            height={24} 
                            borderRadius={8} 
                            style={styles.serviceTitle}
                        />
                        <Shimmer 
                            width={100} 
                            height={20} 
                            borderRadius={8} 
                            style={styles.servicePrice}
                        />
                        <View style={styles.serviceStats}>
                            <Shimmer 
                                width={60} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.rating}
                            />
                            <Shimmer 
                                width={80} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.reviews}
                            />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    serviceCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    serviceImage: {
        width: "100%",
    },
    serviceInfo: {
        padding: 16,
    },
    freelancerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    freelancerThumb: {
        marginRight: 8,
    },
    freelancerName: {
        flex: 1,
    },
    serviceTitle: {
        marginBottom: 8,
    },
    servicePrice: {
        marginBottom: 8,
    },
    serviceStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rating: {
        marginRight: 4,
    },
    reviews: {
        flex: 1,
    },
}); 