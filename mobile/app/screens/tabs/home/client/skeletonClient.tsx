import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "@/constant/color";
import Shimmer from "@/components/Shimmer";

interface SkeletonClientProps {
    count?: number;
}

export default function SkeletonClient({ count = 3 }: SkeletonClientProps) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.card}>
                    <Shimmer width="100%" height={170} />
                    <View style={styles.content}>
                        <View style={styles.profileRow}>
                            <Shimmer width={28} height={28} borderRadius={14} style={styles.avatar} />
                            <Shimmer width={120} height={14} borderRadius={7} style={styles.nameBar} />
                        </View>
                        <Shimmer width="100%" height={18} borderRadius={9} style={styles.titleBar} />
                        <Shimmer width="70%" height={18} borderRadius={9} style={styles.titleBarShort} />
                        <Shimmer width={100} height={20} borderRadius={10} style={styles.priceBar} />
                        <View style={styles.ratingRow}>
                            <Shimmer width={60} height={24} borderRadius={8} style={styles.ratingBadge} />
                            <Shimmer width={80} height={14} borderRadius={7} style={styles.reviewsBar} />
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 8,
        paddingBottom: 8,
    },
    card: {
        width: 280,
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        marginRight: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(229, 231, 235, 0.5)",
    },
    image: {
        width: "100%",
        height: 170,
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    content: {
        padding: 18,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    avatar: {
        marginRight: 10,
    },
    nameBar: {
        // No additional styles needed
    },
    titleBar: {
        marginBottom: 8,
    },
    titleBarShort: {
        marginBottom: 10,
    },
    priceBar: {
        marginBottom: 10,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    ratingBadge: {
        marginRight: 8,
    },
    reviewsBar: {
        // No additional styles needed
    },
});