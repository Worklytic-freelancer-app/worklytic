import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

export default function SkeletonChooseFreelancer() {
    return (
        <View style={styles.container}>
            {/* Project Info Skeleton */}
            <View style={styles.projectInfoContainer}>
                <View style={styles.projectInfo}>
                    <View style={styles.projectHeader}>
                        <View style={styles.projectTitleContainer}>
                            <Shimmer width={80} height={24} borderRadius={8} style={styles.category} />
                            <Shimmer width="100%" height={24} borderRadius={8} style={styles.title} />
                            <Shimmer width="80%" height={24} borderRadius={8} style={[styles.title, { marginTop: 4 }]} />
                        </View>
                        <View style={styles.budgetContainer}>
                            <Shimmer width={60} height={16} borderRadius={8} style={styles.budgetLabel} />
                            <Shimmer width={120} height={24} borderRadius={8} style={styles.budget} />
                        </View>
                    </View>
                    <View style={styles.applicantsInfo}>
                        <Shimmer width={100} height={20} borderRadius={8} />
                    </View>
                </View>
            </View>

            {/* Applicants List Skeleton */}
            <View style={styles.applicantsList}>
                {[1, 2, 3].map((_, index) => (
                    <View key={index} style={styles.applicantCard}>
                        <View style={styles.applicantHeader}>
                            <Shimmer width={56} height={56} borderRadius={28} style={styles.avatar} />
                            <View style={styles.applicantInfo}>
                                <Shimmer width={160} height={24} borderRadius={8} style={styles.name} />
                                <Shimmer width={80} height={18} borderRadius={8} style={styles.rating} />
                            </View>
                            <Shimmer width={36} height={36} borderRadius={18} style={styles.menuButton} />
                        </View>
                        
                        {/* Details section */}
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailsRow}>
                                <Shimmer width={160} height={20} borderRadius={8} style={styles.detailItem} />
                            </View>
                            <View style={styles.detailsRow}>
                                <Shimmer width={140} height={20} borderRadius={8} style={styles.detailItem} />
                            </View>
                        </View>
                        
                        {/* Cover letter */}
                        <Shimmer width="100%" height={80} borderRadius={12} style={styles.coverLetter} />
                        
                        {/* Action buttons */}
                        <View style={styles.actionButtons}>
                            <Shimmer width="48%" height={44} borderRadius={12} />
                            <Shimmer width="48%" height={44} borderRadius={12} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    projectInfoContainer: {
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 16,
    },
    projectInfo: {
        backgroundColor: COLORS.background,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
    },
    projectTitleContainer: {
        flex: 1,
    },
    category: {
        marginBottom: 12,
    },
    title: {
        marginBottom: 8,
    },
    budgetContainer: {
        alignItems: 'flex-end',
    },
    budgetLabel: {
        marginBottom: 4,
    },
    budget: {
        marginBottom: 4,
    },
    applicantsInfo: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    applicantsList: {
        padding: 20,
    },
    applicantCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    applicantHeader: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
    },
    avatar: {
        marginRight: 16,
    },
    applicantInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        marginBottom: 8,
    },
    rating: {
        marginTop: 4,
    },
    menuButton: {
        position: 'absolute',
        right: 0,
    },
    detailsContainer: {
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'column',
        gap: 12,
    },
    detailsRow: {
        flexDirection: 'row',
    },
    detailItem: {
        flex: 0,
    },
    coverLetter: {
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
}); 