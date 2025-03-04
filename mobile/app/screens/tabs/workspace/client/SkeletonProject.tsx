import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

interface SkeletonProjectProps {
    count?: number;
}

export default function SkeletonProject({ count = 5 }: SkeletonProjectProps) {
    return (
        <View style={styles.container}>
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.projectCard}>
                    <View style={styles.cardContent}>
                        <View style={styles.cardRow}>
                            <Shimmer width={70} height={70} borderRadius={8} style={styles.imageContainer} />
                            <View style={styles.projectInfo}>
                                <Shimmer width="80%" height={16} borderRadius={8} style={styles.titleShimmer} />
                                <Shimmer width="50%" height={15} borderRadius={8} style={styles.budgetShimmer} />
                                <View style={styles.projectMeta}>
                                    <Shimmer width={60} height={12} borderRadius={6} style={styles.metaShimmer} />
                                    <Shimmer width={60} height={12} borderRadius={6} style={styles.metaShimmer} />
                                </View>
                            </View>
                            <View style={styles.rightContainer}>
                                <Shimmer width={50} height={16} borderRadius={6} />
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    projectCard: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    cardContent: {
        padding: 12,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    imageContainer: {
        marginRight: 12,
    },
    projectInfo: {
        flex: 1,
        paddingRight: 12,
    },
    rightContainer: {
        width: 50,
        height: 70,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    titleShimmer: {
        marginBottom: 8,
    },
    budgetShimmer: {
        marginBottom: 12,
    },
    projectMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    metaShimmer: {
        marginRight: 12,
    },
}); 