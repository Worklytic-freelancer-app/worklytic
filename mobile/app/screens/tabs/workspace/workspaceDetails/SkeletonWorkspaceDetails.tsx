import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

export default function SkeletonWorkspaceDetails() {
    return (
        <View style={styles.container}>
            {/* Project Info Skeleton */}
            <View style={styles.projectInfoContainer}>
                <View style={styles.projectInfo}>
                    <View style={styles.projectHeader}>
                        <View style={styles.projectTitleContainer}>
                            <Shimmer width={80} height={24} borderRadius={8} style={styles.titleSkeleton} />
                            <Shimmer width="100%" height={24} borderRadius={8} style={styles.budgetSkeleton} />
                        </View>
                        <View style={styles.statusContainer}>
                            <Shimmer width={80} height={24} borderRadius={12} style={styles.statusSkeleton} />
                        </View>
                    </View>
                    <View style={styles.projectMeta}>
                        <View style={styles.metaItem}>
                            <Shimmer width={16} height={16} borderRadius={8} style={styles.iconSkeleton} />
                            <Shimmer width={80} height={16} borderRadius={8} style={styles.metaTextSkeleton} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Discussion Items Skeleton */}
            <View style={styles.discussionsContainer}>
                {[1, 2, 3].map((_, index) => (
                    <View key={index} style={styles.updateItem}>
                        <View style={styles.updateHeader}>
                            <View style={styles.userInfo}>
                                <Shimmer width={40} height={40} borderRadius={20} style={styles.avatarSkeleton} />
                                <View style={styles.userMeta}>
                                    <Shimmer width={120} height={20} borderRadius={8} style={styles.nameSkeleton} />
                                    <Shimmer width={80} height={20} borderRadius={12} style={styles.roleSkeleton} />
                                </View>
                            </View>
                            <Shimmer width={60} height={16} borderRadius={8} style={styles.dateSkeleton} />
                        </View>
                        
                        <Shimmer width="100%" height={60} borderRadius={8} style={styles.contentSkeleton} />
                        
                        <View style={styles.attachmentsContainer}>
                            <View style={styles.attachmentItem}>
                                <View style={styles.attachmentContent}>
                                    <Shimmer width={36} height={36} borderRadius={18} style={styles.attachmentIconSkeleton} />
                                    <View style={styles.attachmentDetails}>
                                        <Shimmer width={120} height={16} borderRadius={8} style={styles.attachmentNameSkeleton} />
                                        <Shimmer width={80} height={12} borderRadius={6} style={styles.attachmentMetaSkeleton} />
                                    </View>
                                </View>
                                <Shimmer width={36} height={36} borderRadius={18} style={styles.downloadButtonSkeleton} />
                            </View>
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
        marginBottom: 16,
    },
    projectTitleContainer: {
        flex: 1,
        gap: 8,
    },
    titleSkeleton: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        alignSelf: 'flex-start',
    },
    budgetSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusSkeleton: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
    projectMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    metaTextSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    discussionsContainer: {
        padding: 16,
    },
    updateItem: {
        marginBottom: 16,
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    updateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userMeta: {
        gap: 4,
    },
    avatarSkeleton: {
        borderWidth: 2,
        borderColor: 'rgba(8, 145, 178, 0.1)',
    },
    nameSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    roleSkeleton: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        width: 80,
    },
    dateSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    contentSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    attachmentsContainer: {
        gap: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    attachmentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    attachmentIconSkeleton: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
    attachmentDetails: {
        flex: 1,
        gap: 4,
    },
    attachmentNameSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    attachmentMetaSkeleton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    downloadButtonSkeleton: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
});