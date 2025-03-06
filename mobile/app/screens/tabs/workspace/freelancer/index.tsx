import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, CheckCircle2, XCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/tanstack/useUser";
import { useFetch } from "@/hooks/tanstack/useFetch";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { COLORS } from "@/constant/color";
import SkeletonProject from "../client/SkeletonProject";

interface ProjectFeature {
    _id: string;
    projectId: string;
    freelancerId: string;
    status: "pending" | "in progress" | "completed";
    content: Array<{
        title: string;
        description: string;
        images: string[];
        files: string[];
    }>;
    createdAt: string;
    updatedAt: string;
    project?: {
        _id: string;
        title: string;
        budget: number;
        image: string[];
        client?: {
            _id: string;
            fullName: string;
            profileImage: string;
        };
    };
}

// Definisikan tipe status yang valid
type ProjectStatus = "pending" | "in progress" | "completed";

export default function FreelancerWorkspace() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { data: user, isLoading: userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [myProjects, setMyProjects] = useState<ProjectFeature[]>([]);

    // Gunakan useFetch untuk mendapatkan project features
    const { 
        data: projectFeatures = [], 
        isLoading: featuresLoading, 
        error: featuresError,
        refetch: refetchFeatures
    } = useFetch<ProjectFeature[]>({
        endpoint: 'projectfeatures',
        requiresAuth: true,
        enabled: !!user?._id
    });

    useEffect(() => {
        if (!featuresLoading && projectFeatures.length > 0 && user?._id) {
            // Filter project features yang dimiliki oleh freelancer yang sedang login
            const freelancerProjects = projectFeatures.filter(
                feature => feature.freelancerId === user._id
            );
            setMyProjects(freelancerProjects);
            setLoading(false);
        } else if (!featuresLoading) {
            setLoading(false);
        }
    }, [featuresLoading, projectFeatures, user]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
            return 'Today';
        } else if (diffDays < 2) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} Days Ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} Ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'Month' : 'Months'} Ago`;
        }
    };

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case "pending":
                return "#f59e0b";
            case "in progress":
                return "#10b981";
            case "completed":
                return "#6b7280";
            default:
                return "#6b7280";
        }
    };

    const getStatusIcon = (status: ProjectStatus) => {
        switch (status) {
            case "pending":
                return <Clock size={16} color="#f59e0b" />;
            case "in progress":
                return <CheckCircle2 size={16} color="#10b981" />;
            case "completed":
                return <CheckCircle2 size={16} color="#6b7280" />;
            default:
                return <Clock size={16} color="#6b7280" />;
        }
    };

    const getStatusDisplay = (status: ProjectStatus) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "in progress":
                return "In Progress";
            case "completed":
                return "Completed";
            default:
                return "Unknown";
        }
    };

    const renderProject = ({ item }: { item: ProjectFeature }) => (
        <TouchableOpacity 
            style={styles.projectCard} 
            onPress={() => navigation.navigate("WorkspaceDetails", { 
                projectId: item.projectId,
                freelancerId: user?._id
            })}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                    <View style={styles.imageContainer}>
                        <ImageWithSkeleton 
                            source={{ 
                                uri: item.project?.image?.[0] || 
                                    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60" 
                            }} 
                            style={styles.projectImage}
                            skeletonStyle={{ width: "100%", height: "100%", borderRadius: 8 }}
                        />
                    </View>
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                            {item.project?.title || "Untitled Project"}
                        </Text>
                        <Text style={styles.projectBudget}>
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            }).format(item.project?.budget || 0)}
                        </Text>
                        <View style={styles.projectMeta}>
                            <View style={styles.metaItem}>
                                <Clock size={14} color={COLORS.gray} />
                                <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    {item.project?.client && (
                        <View style={styles.clientInfo}>
                            <ImageWithSkeleton 
                                source={{ uri: item.project.client.profileImage }}
                                style={styles.clientImage}
                                skeletonStyle={{ width: 24, height: 24, borderRadius: 12 }}
                            />
                            <Text style={styles.clientName} numberOfLines={1}>
                                {item.project.client.fullName}
                            </Text>
                        </View>
                    )}
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: `${getStatusColor(item.status)}15` }
                    ]}>
                        {getStatusIcon(item.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusDisplay(item.status)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading || userLoading || featuresLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Projects</Text>
                </View>
                <SkeletonProject />
            </View>
        );
    }

    if (error || featuresError) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Projects</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || (featuresError as Error)?.message}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton} 
                        onPress={() => refetchFeatures()}
                    >
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Projects</Text>
            </View>

            <FlatList<ProjectFeature> 
                data={myProjects} 
                renderItem={renderProject} 
                keyExtractor={(item) => item._id.toString()} 
                contentContainerStyle={styles.projectsList} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={featuresLoading}
                        onRefresh={refetchFeatures}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        progressBackgroundColor={COLORS.background}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Projects</Text>
                        <Text style={styles.emptyText}>
                            You don't have any active projects at the moment
                        </Text>
                    </View>
                }
            />
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
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.black,
    },
    projectsList: {
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
    },
    imageContainer: {
        width: 70,
        height: 70,
        borderRadius: 8,
        overflow: "hidden",
        marginRight: 12,
    },
    projectImage: {
        width: "100%",
        height: "100%",
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
    },
    projectBudget: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.success,
        marginBottom: 8,
    },
    projectMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 4,
        fontWeight: "500",
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    clientImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    clientName: {
        fontSize: 12,
        color: COLORS.darkGray,
        fontWeight: "500",
        maxWidth: 120,
    },
});