import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Star, MapPin, Filter, ArrowLeft, Clock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { COLORS } from "@/constant/color";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SkeletonFreelancer from './SkeletonFreelancer';

interface ApiFreelancer {
    _id: string;
    fullName: string;
    profileImage: string;
    skills: string[];
    rating: number;
    role: string;
    location: string;
    hourlyRate?: number;
}

type FreelancersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Freelancers() {
    const navigation = useNavigation<FreelancersScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFreelancers, setFilteredFreelancers] = useState<ApiFreelancer[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    
    // Gunakan useFetch untuk mendapatkan data freelancer
    const { data: freelancers, isLoading, error, refetch } = useFetch<ApiFreelancer[]>({
        endpoint: 'users',
        requiresAuth: true,
    });
    
    // Filter freelancer berdasarkan role dan urutkan berdasarkan rating
    const sortedFreelancers = React.useMemo(() => {
        if (!freelancers) return [];
        
        return freelancers
            .filter(user => user.role === 'freelancer')
            .sort((a, b) => b.rating - a.rating);
    }, [freelancers]);
    
    // Update filtered freelancers saat data berubah atau search query berubah
    useEffect(() => {
        if (!sortedFreelancers) {
            setFilteredFreelancers([]);
            return;
        }
        
        if (searchQuery.trim() === "") {
            setFilteredFreelancers(sortedFreelancers);
        } else {
            const filtered = sortedFreelancers.filter(
                (freelancer) =>
                    freelancer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (freelancer.skills && 
                     freelancer.skills.some(skill => 
                        skill.toLowerCase().includes(searchQuery.toLowerCase())
                     ))
            );
            setFilteredFreelancers(filtered);
        }
    }, [searchQuery, sortedFreelancers]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const renderFreelancer = ({ item }: { item: ApiFreelancer }) => (
        <TouchableOpacity 
            style={styles.freelancerCard}
            onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item._id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.profileSection}>
                    <ImageWithSkeleton 
                        source={{ 
                            uri: item.profileImage || 
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=random` 
                        }} 
                        style={styles.freelancerImage}
                        skeletonStyle={{ borderRadius: 24 }}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{item.fullName}</Text>
                        {item.skills && item.skills.length > 0 && (
                            <Text style={styles.role}>{item.skills[0]}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.rating}>{item.rating?.toFixed(1) || "0.0"}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    {item.hourlyRate && (
                        <View style={[styles.infoItem, styles.hourlyRateItem]}>
                            <Clock size={16} color={COLORS.gray} />
                            <Text style={styles.infoText} numberOfLines={1}>
                                Rp{item.hourlyRate.toLocaleString('id-ID')}/jam
                            </Text>
                        </View>
                    )}
                    {item.location && (
                        <View style={[styles.infoItem, { flex: 1 }]}>
                            <MapPin size={16} color={COLORS.gray} />
                            <Text style={styles.infoText} numberOfLines={1}>
                                {item.location}
                            </Text>
                        </View>
                    )}
                </View>

                {item.skills && item.skills.length > 0 && (
                    <View style={styles.skillsContainer}>
                        {item.skills.slice(0, 3).map((skill, index) => (
                            <View key={index} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Freelancers</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Filter size={22} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search freelancer or skill..."
                        editable={false}
                        placeholderTextColor={COLORS.gray}
                    />
                </View>

                <SkeletonFreelancer />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Freelancers</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load freelancer data</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => refetch()}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.background }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.title}>Freelancers</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={22} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color={COLORS.gray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search freelancer or skill..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray}
                />
            </View>

            {filteredFreelancers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No freelancer found 😕</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredFreelancers}
                    renderItem={renderFreelancer}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.black,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.inputBackground,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBackground,
        marginHorizontal: 20,
        marginVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.black,
    },
    listContainer: {
        padding: 20,
        paddingTop: 4,
    },
    freelancerCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    freelancerImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
    },
    profileInfo: {
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: COLORS.gray,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.warning,
    },
    cardContent: {
        padding: 16,
    },
    infoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBackground,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        flexShrink: 1,
        minWidth: 100,
    },
    hourlyRateItem: {
        maxWidth: '48%',
    },
    infoText: {
        marginLeft: 6,
        fontSize: 14,
        color: COLORS.darkGray,
        fontWeight: "500",
        flexShrink: 1,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    skillBadge: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    skillText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: "500",
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    retryText: {
        color: COLORS.background,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        fontWeight: "500",
    },
});
