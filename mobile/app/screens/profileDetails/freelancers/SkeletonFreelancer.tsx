import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

interface SkeletonFreelancerProps {
    count?: number;
}

export default function SkeletonFreelancer({ count = 5 }: SkeletonFreelancerProps) {
    return (
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.freelancerCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.profileSection}>
                            <Shimmer 
                                width={48} 
                                height={48} 
                                borderRadius={24} 
                                style={styles.avatar} 
                            />
                            <View style={styles.profileInfo}>
                                <Shimmer 
                                    width={120} 
                                    height={16} 
                                    borderRadius={8} 
                                    style={styles.nameBar} 
                                />
                                <Shimmer 
                                    width={80} 
                                    height={14} 
                                    borderRadius={7} 
                                    style={styles.roleBar} 
                                />
                            </View>
                        </View>
                        <Shimmer 
                            width={60} 
                            height={24} 
                            borderRadius={8} 
                            style={styles.ratingBadge} 
                        />
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Shimmer 
                                width={120} 
                                height={32} 
                                borderRadius={8} 
                                style={styles.hourlyRateItem} 
                            />
                            <Shimmer 
                                width="100%" 
                                height={32} 
                                borderRadius={8} 
                                style={styles.locationItem} 
                            />
                        </View>

                        <View style={styles.skillsContainer}>
                            <Shimmer 
                                width={80} 
                                height={32} 
                                borderRadius={16} 
                                style={styles.skillBadge} 
                            />
                            <Shimmer 
                                width={100} 
                                height={32} 
                                borderRadius={16} 
                                style={styles.skillBadge} 
                            />
                            <Shimmer 
                                width={90} 
                                height={32} 
                                borderRadius={16} 
                                style={styles.skillBadge} 
                            />
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 4,
    },
    freelancerCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
    },
    profileInfo: {
        marginLeft: 12,
        gap: 8,
    },
    nameBar: {
        marginBottom: 4,
    },
    roleBar: {
        // No additional styles needed
    },
    ratingBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    cardContent: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    hourlyRateItem: {
        backgroundColor: COLORS.inputBackground,
        width: '30%', // Sesuaikan dengan lebar yang diinginkan
    },
    locationItem: {
        backgroundColor: COLORS.inputBackground,
        flex: 1,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
}); 