import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Star, ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

interface ApiFreelancer {
    _id: string;
    fullName: string;
    profileImage: string;
    skills: string[];
    rating: number;
    role: string;
}

interface TopFreelancerProps {
    freelancers: ApiFreelancer[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    title?: string;
    showSeeAll?: boolean;
}

export default function TopFreelancer({ 
    freelancers, 
    loading, 
    error, 
    onRetry,
    title = "Top Freelancers",
    showSeeAll = true
}: TopFreelancerProps) {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleSeeAll = () => {
        navigation.navigate("Freelancers");
    };

    if (loading) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {showSeeAll && (
                        <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                            <Text style={styles.seeAllText}>Lihat Semua</Text>
                            <ChevronRight size={16} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {showSeeAll && (
                        <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                            <Text style={styles.seeAllText}>Lihat Semua</Text>
                            <ChevronRight size={16} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!freelancers || freelancers.length === 0) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {showSeeAll && (
                        <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                            <Text style={styles.seeAllText}>Lihat Semua</Text>
                            <ChevronRight size={16} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Tidak ada freelancer tersedia</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {showSeeAll && (
                    <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                        <Text style={styles.seeAllText}>Lihat Semua</Text>
                        <ChevronRight size={16} color="#2563eb" />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={freelancers}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.freelancerCard} 
                        onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item._id })}
                    >
                        <Image 
                            source={{ uri: item.profileImage || 'https://via.placeholder.com/150' }} 
                            style={styles.freelancerImage} 
                        />
                        <Text style={styles.freelancerName}>{item.fullName}</Text>
                        <Text style={styles.freelancerRole}>
                            {item.skills && item.skills.length > 0 ? item.skills[0] : "Freelancer"}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Star size={16} color="#FDB022" fill="#FDB022" />
                            <Text style={styles.rating}>{item.rating || 0}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.freelancersScroll}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 14,
        color: "#2563eb",
        fontWeight: "500",
    },
    freelancersScroll: {
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
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    freelancerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
        textAlign: "center",
    },
    freelancerRole: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
        textAlign: "center",
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        color: "#111827",
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        marginBottom: 12,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});