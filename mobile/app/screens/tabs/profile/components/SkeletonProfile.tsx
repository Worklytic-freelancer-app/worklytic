import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

export default function SkeletonProfile() {
    return (
        <View style={styles.container}>
            {/* Profile Info Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileHeader}>
                    <Shimmer 
                        width={100} 
                        height={100} 
                        borderRadius={50} 
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Shimmer width={180} height={24} borderRadius={12} style={styles.name} />
                        <View style={styles.locationContainer}>
                            <Shimmer width={140} height={18} borderRadius={9} />
                        </View>
                        <View style={styles.ratingContainer}>
                            <Shimmer width={120} height={18} borderRadius={9} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Balance Section */}
            <View style={styles.balanceCard}>
                <Shimmer width={100} height={18} borderRadius={9} style={styles.balanceLabel} />
                <Shimmer width={160} height={32} borderRadius={16} style={styles.balanceAmount} />
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                {[1, 2, 3].map((_, index) => (
                    <View key={index} style={styles.statItem}>
                        <Shimmer width={80} height={20} borderRadius={10} style={styles.statValue} />
                        <Shimmer width={100} height={16} borderRadius={8} style={styles.statLabel} />
                    </View>
                ))}
            </View>

            {/* About Section */}
            <View style={styles.aboutSection}>
                <Shimmer width={100} height={24} borderRadius={12} style={styles.sectionTitle} />
                <View style={styles.aboutContent}>
                    <Shimmer width="100%" height={16} borderRadius={8} style={styles.aboutText} />
                    <Shimmer width="90%" height={16} borderRadius={8} style={styles.aboutText} />
                    <Shimmer width="95%" height={16} borderRadius={8} style={styles.aboutText} />
                </View>
            </View>

            {/* Skills Section */}
            <View style={styles.skillsSection}>
                <Shimmer width={100} height={24} borderRadius={12} style={styles.sectionTitle} />
                <View style={styles.skillsContainer}>
                    {[1, 2, 3, 4].map((_, index) => (
                        <Shimmer 
                            key={index}
                            width={80} 
                            height={32} 
                            borderRadius={16} 
                            style={styles.skillItem} 
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
        paddingHorizontal: 20,
    },
    profileSection: {
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
        gap: 8,
    },
    name: {
        marginBottom: 4,
    },
    locationContainer: {
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    balanceLabel: {
        marginBottom: 8,
    },
    balanceAmount: {
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statItem: {
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        marginBottom: 4,
    },
    statLabel: {
        textAlign: 'center',
        marginBottom: 4,
    },
    aboutSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    aboutContent: {
        gap: 8,
    },
    aboutText: {
        marginBottom: 8,
    },
    skillsSection: {
        marginBottom: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillItem: {
        marginBottom: 8,
    },
}); 