import { View, StyleSheet } from "react-native";
import { COLORS } from "@/constant/color";
import Shimmer from "@/components/Shimmer";

interface SkeletonProjectProps {
    count?: number;
}

export default function SkeletonProject({ count = 5 }: SkeletonProjectProps) {
    return (
        <View style={styles.container}>
            {Array(count).fill(0).map((_, index) => (
                <View key={index} style={styles.projectCard}>
                    <Shimmer width="100%" height={160} />
                    <View style={styles.projectInfo}>
                        <View style={styles.projectHeader}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Shimmer width="90%" height={20} borderRadius={10} style={{ marginBottom: 8 }} />
                                <Shimmer width="60%" height={18} borderRadius={9} />
                            </View>
                            <Shimmer width={100} height={20} borderRadius={10} />
                        </View>

                        <View style={styles.clientContainer}>
                            <Shimmer width={32} height={32} borderRadius={16} style={{ marginRight: 8 }} />
                            <View>
                                <Shimmer width={120} height={16} borderRadius={8} style={{ marginBottom: 4 }} />
                                <Shimmer width={80} height={14} borderRadius={7} />
                            </View>
                        </View>

                        <Shimmer width="40%" height={16} borderRadius={8} style={{ marginVertical: 8 }} />
                        <Shimmer width="100%" height={32} borderRadius={8} style={{ marginBottom: 12 }} />

                        <View style={styles.assignedFreelancerContainer}>
                            <View style={styles.freelancerImages}>
                                {[1, 2, 3].map((_, idx) => (
                                    <Shimmer 
                                        key={idx}
                                        width={28} 
                                        height={28} 
                                        borderRadius={14} 
                                        style={{ marginLeft: idx > 0 ? -12 : 0 }}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.projectFooter}>
                            <Shimmer width={80} height={24} borderRadius={12} />
                            <Shimmer width={100} height={16} borderRadius={8} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    projectCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    projectInfo: {
        padding: 16,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    clientContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    assignedFreelancerContainer: {
        marginVertical: 8,
    },
    freelancerImages: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    projectFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
}); 