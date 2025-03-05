import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

export default function SkeletonWorklyticAIClient() {
    return (
        <View style={styles.container}>
            {/* Hero Section Skeleton */}
            <View style={styles.heroSection}>
                <View style={styles.heroContent}>
                    <Shimmer width={180} height={32} borderRadius={8} style={styles.heroTitle} />
                    <Shimmer width="90%" height={20} borderRadius={8} style={styles.heroSubtitle} />
                </View>
                <Shimmer width={80} height={80} borderRadius={40} style={styles.heroIcon} />
            </View>

            {/* Stats Container Skeleton */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Shimmer width={56} height={56} borderRadius={28} style={styles.statIcon} />
                    <Shimmer width={60} height={30} borderRadius={8} style={styles.statValue} />
                    <Shimmer width={80} height={18} borderRadius={8} style={styles.statLabel} />
                </View>
                <View style={styles.statCard}>
                    <Shimmer width={56} height={56} borderRadius={28} style={styles.statIcon} />
                    <Shimmer width={40} height={30} borderRadius={8} style={styles.statValue} />
                    <Shimmer width={80} height={18} borderRadius={8} style={styles.statLabel} />
                </View>
            </View>

            {/* Section Title */}
            <View style={styles.section}>
                <Shimmer width={150} height={26} borderRadius={8} style={styles.sectionTitle} />
                
                {/* Matches Cards */}
                <View style={styles.matchesContainer}>
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.matchCard}>
                            <Shimmer width="100%" height={160} borderRadius={16} style={styles.matchImage} />
                            
                            <View style={styles.matchContent}>
                                <View style={styles.matchHeader}>
                                    <Shimmer width={100} height={20} borderRadius={8} style={styles.matchCategory} />
                                    <Shimmer width={120} height={20} borderRadius={8} style={styles.matchBudget} />
                                </View>
                                
                                <Shimmer width="100%" height={24} borderRadius={8} style={styles.matchTitle} />
                                <Shimmer width="80%" height={24} borderRadius={8} style={[styles.matchTitle, { marginTop: 4 }]} />
                                
                                <View style={styles.skillsContainer}>
                                    <Shimmer width={80} height={24} borderRadius={12} />
                                    <Shimmer width={100} height={24} borderRadius={12} />
                                    <Shimmer width={70} height={24} borderRadius={12} />
                                </View>
                                
                                <Shimmer width="100%" height={44} borderRadius={12} style={styles.detailButton} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* AI Features Skeleton */}
            <View style={styles.aiFeatures}>
                <Shimmer width={150} height={26} borderRadius={8} style={styles.sectionTitle} />
                
                <View style={styles.featuresContainer}>
                    <View style={styles.featureCard}>
                        <Shimmer width={48} height={48} borderRadius={24} />
                        <View style={styles.featureContent}>
                            <Shimmer width={150} height={20} borderRadius={8} style={styles.featureTitle} />
                            <Shimmer width="80%" height={16} borderRadius={8} style={styles.featureDescription} />
                        </View>
                        <Shimmer width={20} height={20} borderRadius={10} />
                    </View>
                    
                    <View style={styles.featureCard}>
                        <Shimmer width={48} height={48} borderRadius={24} />
                        <View style={styles.featureContent}>
                            <Shimmer width={150} height={20} borderRadius={8} style={styles.featureTitle} />
                            <Shimmer width="80%" height={16} borderRadius={8} style={styles.featureDescription} />
                        </View>
                        <Shimmer width={20} height={20} borderRadius={10} />
                    </View>
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
    heroSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 15,
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        marginBottom: 12,
    },
    heroSubtitle: {
        marginBottom: 4,
    },
    heroIcon: {
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 16,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        marginBottom: 12,
    },
    statValue: {
        marginBottom: 8,
    },
    statLabel: {
        marginTop: 4,
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    matchesContainer: {
        gap: 16,
    },
    matchCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    matchImage: {
        width: '100%',
    },
    matchContent: {
        padding: 16,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    matchCategory: {
        marginBottom: 4,
    },
    matchBudget: {
        marginBottom: 4,
    },
    matchTitle: {
        marginBottom: 12,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    detailButton: {
        marginTop: 8,
    },
    aiFeatures: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    featuresContainer: {
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featureContent: {
        flex: 1,
        marginLeft: 16,
    },
    featureTitle: {
        marginBottom: 8,
    },
    featureDescription: {
        marginTop: 4,
    },
}); 