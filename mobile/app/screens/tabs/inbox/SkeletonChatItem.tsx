import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

interface SkeletonChatItemProps {
    count?: number;
}

export default function SkeletonChatItem({ count = 8 }: SkeletonChatItemProps) {
    return (
        <View style={styles.container}>
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.chatItem}>
                    <Shimmer width={56} height={56} borderRadius={28} style={styles.profilePic} />
                    <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                            <Shimmer width="60%" height={16} borderRadius={8} style={styles.nameShimmer} />
                            <Shimmer width={40} height={12} borderRadius={6} style={styles.timeShimmer} />
                        </View>
                        <View style={styles.messageFooter}>
                            <Shimmer width="80%" height={14} borderRadius={7} style={styles.messageShimmer} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chatItem: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
        backgroundColor: COLORS.background,
        marginVertical: 6,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    profilePic: {
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
        marginLeft: 4,
    },
    messageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    messageFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    nameShimmer: {
        marginRight: 8,
    },
    timeShimmer: {
        // No additional styles needed
    },
    messageShimmer: {
        // No additional styles needed
    },
}); 