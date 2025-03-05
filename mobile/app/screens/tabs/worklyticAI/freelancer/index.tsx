import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Zap, Brain, Target, Briefcase, ChevronRight } from "lucide-react-native";
import { SecureStoreUtils } from "../../../../utils/SecureStore";
import { baseUrl } from "../../../../constant/baseUrl";
import { COLORS } from "../../../../constant/color";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SkeletonWorklyticAIFreelancer from "./SkeletonWorklyticAIFreelancer";

interface AIRecommendation {
    projectId: string;
    title: string;
    matchPercentage: number;  
    budget: number;
    category: string;
    skills: string[];
    image: string[];
}

export default function WorklyticAIFreelancer() {
    const insets = useSafeAreaInsets();
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const userData = await SecureStoreUtils.getUserData();
            const token = await SecureStoreUtils.getToken();
            
            const response = await fetch(`${baseUrl}/api/projects/aiRecommendations`, {
                headers: {
                    'user': JSON.stringify(userData),
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setRecommendations(data.data);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRecommendations();
        setRefreshing(false);
    }, []);

    const formatBudget = (budget: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(budget);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Match</Text>
            </View>

            {loading ? (
                <SkeletonWorklyticAIFreelancer />
            ) : (
                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    <View style={styles.heroSection}>
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>Rekomendasi AI</Text>
                            <Text style={styles.heroSubtitle}>Temukan pekerjaan yang paling cocok untukmu</Text>
                        </View>
                        <View style={styles.heroIcon}>
                            <Brain size={48} color={COLORS.primary} />
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Target size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.statValue}>
                                {recommendations.length > 0 
                                    ? `${Math.round(recommendations.map((item) => item.matchPercentage).reduce((a, b) => a + b, 0) / recommendations.length)}%`
                                    : '0%'
                                }
                            </Text>
                            <Text style={styles.statLabel}>Match Rate</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Briefcase size={24} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.statValue}>{recommendations.length}</Text>
                            <Text style={styles.statLabel}>Matches</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Matches</Text>
                        
                        {recommendations.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Brain size={40} color={COLORS.gray} />
                                <Text style={styles.emptyStateText}>Belum ada rekomendasi tersedia</Text>
                            </View>
                        ) : (
                            <View style={styles.matchesContainer}>
                                {recommendations.map((item) => (
                                    <TouchableOpacity key={item.projectId} style={styles.matchCard} activeOpacity={0.8}>
                                        <View style={styles.matchImageContainer}>
                                            <ImageWithSkeleton 
                                                source={{ uri: item.image[0] }} 
                                                style={styles.matchImage} 
                                                resizeMode="cover"
                                            />
                                            <View style={styles.matchLabel}>
                                                <View style={styles.matchBadge}>
                                                    <Zap size={14} color={COLORS.white} />
                                                    <Text style={styles.matchPercentage}>{item.matchPercentage}% Match</Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.matchContent}>
                                            <View style={styles.matchHeader}>
                                                <Text style={styles.matchCategory}>{item.category}</Text>
                                                <Text style={styles.matchBudget}>{formatBudget(item.budget)}</Text>
                                            </View>
                                            
                                            <Text style={styles.matchTitle} numberOfLines={2}>{item.title}</Text>
                                            
                                            <View style={styles.skillsContainer}>
                                                {item.skills.slice(0, 3).map((skill, index) => (
                                                    <View key={index} style={styles.skillBadge}>
                                                        <Text style={styles.skillText}>{skill}</Text>
                                                    </View>
                                                ))}
                                                {item.skills.length > 3 && (
                                                    <View style={[styles.skillBadge, styles.moreSkillBadge]}>
                                                        <Text style={styles.skillText}>+{item.skills.length - 3}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            
                                            <TouchableOpacity style={styles.detailButton}>
                                                <Text style={styles.detailButtonText}>Lihat Detail</Text>
                                                <ChevronRight size={16} color={COLORS.white} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.aiFeatures}>
                        <Text style={styles.sectionTitle}>Fitur AI</Text>
                        
                        <View style={styles.featuresContainer}>
                            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                                <View style={styles.featureIconContainer}>
                                    <Target size={24} color={COLORS.primary} />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Analisis Keahlian</Text>
                                    <Text style={styles.featureDescription}>Dapatkan insight tentang keahlianmu</Text>
                                </View>
                                <ChevronRight size={20} color={COLORS.gray} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                                <View style={styles.featureIconContainer}>
                                    <Brain size={24} color={COLORS.primary} />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Rekomendasi Cerdas</Text>
                                    <Text style={styles.featureDescription}>Terima saran projek yang dipersonalisasi</Text>
                                </View>
                                <ChevronRight size={20} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.bottomPadding} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.black,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: COLORS.black,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: COLORS.darkGray,
        fontWeight: "500",
        lineHeight: 22,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 16,
    },
    statCard: {
        flex: 1,
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.black,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: "500",
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.black,
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
    },
    matchesContainer: {
        gap: 16,
    },
    matchCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    matchImageContainer: {
        position: 'relative',
        height: 160,
    },
    matchImage: {
        width: '100%',
        height: '100%',
    },
    matchLabel: {
        position: 'absolute',
        bottom: 12,
        left: 12,
    },
    matchBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    matchPercentage: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.white,
    },
    matchContent: {
        padding: 16,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    matchCategory: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "600",
    },
    matchTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
        marginBottom: 12,
        lineHeight: 24,
    },
    matchBudget: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.success,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    skillBadge: {
        backgroundColor: "rgba(8, 145, 178, 0.08)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    moreSkillBadge: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    skillText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: "600",
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    detailButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
    },
    aiFeatures: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    featuresContainer: {
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(8, 145, 178, 0.08)",
    },
    featureContent: {
        flex: 1,
        marginLeft: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: COLORS.darkGray,
        lineHeight: 18,
        fontWeight: "500",
    },
    bottomPadding: {
        height: 30,
    },
});
