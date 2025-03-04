import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "@/constant/color";
import Shimmer from "@/components/Shimmer";

interface SkeletonTopFreelancerProps {
    count?: number;
}

export default function SkeletonTopFreelancer({ count = 5 }: SkeletonTopFreelancerProps) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.freelancerCard}>
                    <Shimmer width={80} height={80} borderRadius={40} style={styles.freelancerImage} />
                    <Shimmer width={100} height={16} borderRadius={8} style={styles.nameBar} />
                    <Shimmer width={80} height={14} borderRadius={7} style={styles.roleBar} />
                    <Shimmer width={60} height={24} borderRadius={12} style={styles.ratingContainer} />
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    freelancerCard: {
        width: 160,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    freelancerImage: {
        marginBottom: 12,
    },
    nameBar: {
        marginBottom: 8,
    },
    roleBar: {
        marginBottom: 12,
    },
    ratingContainer: {
        marginTop: 4,
    },
}); 