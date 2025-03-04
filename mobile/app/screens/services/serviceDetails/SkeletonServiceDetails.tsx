import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

const { width } = Dimensions.get('window');

export default function SkeletonServiceDetails() {
    return (
        <View style={styles.container}>
            {/* Image Carousel Skeleton */}
            <Shimmer 
                width={width} 
                height={300}
                style={styles.carouselImage}
            />

            <View style={styles.content}>
                {/* Freelancer Section Skeleton */}
                <View style={styles.freelancerSection}>
                    <Shimmer 
                        width={48} 
                        height={48} 
                        borderRadius={24} 
                        style={styles.freelancerImage}
                    />
                    <View style={styles.freelancerInfo}>
                        <Shimmer 
                            width={150} 
                            height={20} 
                            borderRadius={4} 
                            style={styles.nameShimmer}
                        />
                        <Shimmer 
                            width={100} 
                            height={16} 
                            borderRadius={4} 
                            style={styles.roleShimmer}
                        />
                    </View>
                </View>

                {/* Title Skeleton */}
                <Shimmer 
                    width={width - 40} 
                    height={24} 
                    borderRadius={4} 
                    style={styles.titleShimmer}
                />

                {/* Stats Row Skeleton */}
                <View style={styles.statsRow}>
                    <Shimmer 
                        width={120} 
                        height={16} 
                        borderRadius={4} 
                    />
                    <Shimmer 
                        width={100} 
                        height={16} 
                        borderRadius={4} 
                    />
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Shimmer 
                        width={120} 
                        height={20} 
                        borderRadius={4} 
                        style={styles.sectionTitleShimmer}
                    />
                    <Shimmer 
                        width={width - 40} 
                        height={80} 
                        borderRadius={4} 
                        style={styles.descriptionShimmer}
                    />
                </View>

                {/* Includes Section */}
                <View style={styles.section}>
                    <Shimmer 
                        width={120} 
                        height={20} 
                        borderRadius={4} 
                        style={styles.sectionTitleShimmer}
                    />
                    {[1, 2, 3].map((_, index) => (
                        <Shimmer 
                            key={index}
                            width={width - 60} 
                            height={16} 
                            borderRadius={4} 
                            style={styles.listItemShimmer}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    carouselImage: {
        width: width,
        height: 300,
    },
    content: {
        padding: 20,
    },
    freelancerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    freelancerImage: {
        marginRight: 12,
    },
    freelancerInfo: {
        flex: 1,
        gap: 8,
    },
    nameShimmer: {
        marginBottom: 4,
    },
    roleShimmer: {
        marginBottom: 4,
    },
    titleShimmer: {
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleShimmer: {
        marginBottom: 12,
    },
    descriptionShimmer: {
        marginBottom: 8,
    },
    listItemShimmer: {
        marginBottom: 8,
    },
}); 