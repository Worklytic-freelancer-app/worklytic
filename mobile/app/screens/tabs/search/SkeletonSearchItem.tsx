import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

interface SkeletonSearchItemProps {
    isFreelancer?: boolean;
}

export default function SkeletonSearchItem({ isFreelancer = true }: SkeletonSearchItemProps) {
    return (
        <View style={styles.resultCard}>
            <Shimmer width={80} height={80} borderRadius={12} />
            <View style={styles.resultContent}>
                <Shimmer width="80%" height={18} borderRadius={9} style={styles.title} />
                <Shimmer width="100%" height={14} borderRadius={7} style={styles.description} />
                <Shimmer width="70%" height={14} borderRadius={7} style={styles.description} />
                
                {isFreelancer ? (
                    <>
                        <Shimmer width={120} height={14} borderRadius={7} style={styles.location} />
                        <View style={styles.tagsContainer}>
                            <Shimmer width={60} height={24} borderRadius={10} style={styles.tag} />
                            <Shimmer width={80} height={24} borderRadius={10} style={styles.tag} />
                        </View>
                    </>
                ) : (
                    <>
                        <Shimmer width={100} height={18} borderRadius={9} style={styles.budget} />
                        <View style={styles.projectInfo}>
                            <Shimmer width={100} height={14} borderRadius={7} style={styles.infoItem} />
                            <Shimmer width={80} height={14} borderRadius={7} style={styles.infoItem} />
                        </View>
                        <View style={styles.tagsContainer}>
                            <Shimmer width={70} height={24} borderRadius={10} style={styles.tag} />
                            <Shimmer width={60} height={24} borderRadius={10} style={styles.tag} />
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    resultCard: {
        flexDirection: "row",
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultContent: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        marginBottom: 6,
    },
    description: {
        marginBottom: 4,
    },
    location: {
        marginTop: 8,
        marginBottom: 4,
    },
    budget: {
        marginBottom: 8,
    },
    projectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    infoItem: {
        // No additional styles needed
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    tag: {
        // No additional styles needed
    },
}); 