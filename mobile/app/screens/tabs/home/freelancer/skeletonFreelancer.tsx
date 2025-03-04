import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "@/constant/color";
import Shimmer from "@/components/Shimmer";

interface SkeletonFreelancerProps {
    count?: number;
}

export default function SkeletonFreelancer({ count = 3 }: SkeletonFreelancerProps) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.card}>
                    <Shimmer width="100%" height={140} />
                    <View style={styles.content}>
                        <View style={styles.projectTitle}>
                            <Shimmer width="100%" height={20} borderRadius={10} />
                        </View>
                        <View style={styles.projectCategory}>
                            <Shimmer width="70%" height={16} borderRadius={8} />
                        </View>
                        <View style={styles.projectBudget}>
                            <Shimmer width={120} height={20} borderRadius={10} />
                        </View>
                        <View style={styles.locationContainer}>
                            <Shimmer width={100} height={16} borderRadius={8} />
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
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginRight: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    content: {
        padding: 16,
        gap: 8,
    },
    projectTitle: {
        marginBottom: 4,
    },
    projectCategory: {
        marginBottom: 8,
    },
    projectBudget: {
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}); 