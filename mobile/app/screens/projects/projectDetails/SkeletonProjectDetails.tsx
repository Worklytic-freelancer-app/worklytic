import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

const { width } = Dimensions.get('window');

export default function SkeletonProjectDetails() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Image Carousel Skeleton */}
            <View style={styles.carouselContainer}>
                <Shimmer 
                    width={width} 
                    height={300}
                />
            </View>

            {/* Project Info Skeleton */}
            <View style={styles.infoContainer}>
                {/* Title */}
                <Shimmer 
                    width={width - 40} 
                    height={32} 
                    borderRadius={8} 
                    style={styles.titleBar} 
                />

                {/* Meta Info */}
                <View style={styles.metaRow}>
                    {[1, 2].map((_, index) => (
                        <View key={index} style={styles.metaItem}>
                            <Shimmer 
                                width={80} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.metaLabel} 
                            />
                            <Shimmer 
                                width={100} 
                                height={20} 
                                borderRadius={8} 
                                style={styles.metaValue} 
                            />
                        </View>
                    ))}
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    {[1, 2, 3, 4].map((_, index) => (
                        <View key={index} style={styles.statsCard}>
                            <Shimmer 
                                width={40} 
                                height={40} 
                                borderRadius={20} 
                                style={styles.statsIcon} 
                            />
                            <View style={styles.statsContent}>
                                <Shimmer 
                                    width={60} 
                                    height={12} 
                                    borderRadius={6} 
                                    style={styles.statsLabel} 
                                />
                                <Shimmer 
                                    width={80} 
                                    height={16} 
                                    borderRadius={8} 
                                    style={styles.statsValue} 
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Shimmer 
                        width={120} 
                        height={24} 
                        borderRadius={8} 
                        style={styles.sectionTitle} 
                    />
                    <Shimmer 
                        width="100%" 
                        height={100} 
                        borderRadius={12} 
                        style={styles.description} 
                    />
                </View>

                {/* Requirements Section */}
                <View style={styles.section}>
                    <Shimmer 
                        width={150} 
                        height={24} 
                        borderRadius={8} 
                        style={styles.sectionTitle} 
                    />
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.requirementItem}>
                            <Shimmer 
                                width={8} 
                                height={8} 
                                borderRadius={4} 
                                style={styles.bullet} 
                            />
                            <Shimmer 
                                width={width - 80} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.requirementText} 
                            />
                        </View>
                    ))}
                </View>

                {/* Client Info Section */}
                <View style={styles.section}>
                    <Shimmer 
                        width={100} 
                        height={24} 
                        borderRadius={8} 
                        style={styles.sectionTitle} 
                    />
                    <View style={styles.clientCard}>
                        <Shimmer 
                            width={50} 
                            height={50} 
                            borderRadius={25} 
                            style={styles.clientImage} 
                        />
                        <View style={styles.clientInfo}>
                            <Shimmer 
                                width={150} 
                                height={20} 
                                borderRadius={8} 
                                style={styles.clientName} 
                            />
                            <Shimmer 
                                width={120} 
                                height={16} 
                                borderRadius={8} 
                                style={styles.clientLocation} 
                            />
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    carouselContainer: {
        width: width,
        height: 300,
    },
    infoContainer: {
        padding: 20,
    },
    titleBar: {
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        marginBottom: 8,
    },
    metaValue: {
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statsCard: {
        width: (width - 52) / 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statsIcon: {
        marginRight: 12,
    },
    statsContent: {
        flex: 1,
        gap: 4,
    },
    statsLabel: {
        marginBottom: 4,
    },
    statsValue: {
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    description: {
        marginTop: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    bullet: {
        marginTop: 6,
    },
    requirementText: {
        flex: 1,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    clientImage: {
        marginRight: 16,
    },
    clientInfo: {
        flex: 1,
        gap: 8,
    },
    clientName: {
        marginBottom: 4,
    },
    clientLocation: {
        marginTop: 4,
    },
}); 