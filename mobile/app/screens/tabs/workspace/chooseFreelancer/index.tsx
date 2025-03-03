import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign, CheckCircle, XCircle } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";

interface User {
    _id: string;
    fullName: string;
    profileImage: string;
    location: string;
    rating: number;
    skills: string[];
}

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
    freelancer?: User;
}

interface Project {
    _id: string;
    title: string;
    budget: number;
    image: string[];
}

// Tipe untuk update status request
interface UpdateStatusRequest {
    status: "in progress";
}

// Tipe untuk reject request (kosong, tapi bukan void)
interface RejectRequest {
    // Kosong, tapi bukan void
}

export default function ChooseFreelancer() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { projectId } = route.params as { projectId: string };
    
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch project details
    const { 
        data: project, 
        isLoading: projectLoading, 
        error: projectError,
        refetch: refetchProject
    } = useFetch<Project>({
        endpoint: `projects/${projectId}`,
        requiresAuth: true
    });

    // Fetch project features (applicants)
    const { 
        data: allFeatures = [], 
        isLoading: featuresLoading, 
        error: featuresError,
        refetch: refetchFeatures
    } = useFetch<ProjectFeature[]>({
        endpoint: 'projectfeatures',
        requiresAuth: true
    });

    // Fetch freelancer details for each feature
    const { 
        data: users = [], 
        isLoading: usersLoading, 
        error: usersError,
        refetch: refetchUsers
    } = useFetch<User[]>({
        endpoint: 'users',
        requiresAuth: true
    });

    // Filter features for this project and add freelancer data
    const applicants = allFeatures
        .filter((feature) => feature.projectId === projectId)
        .map(feature => {
            const freelancer = users.find(user => user._id === feature.freelancerId);
            return {
                ...feature,
                freelancer
            };
        });

    // Mutation untuk menerima freelancer
    const acceptFreelancer = useMutation<ProjectFeature, UpdateStatusRequest>({
        endpoint: 'projectfeatures',
        method: 'PATCH',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data
            refetchFeatures();
            Alert.alert('Sukses', 'Freelancer berhasil diterima');
            setActionLoading(null);
        },
        invalidateQueries: ['projectfeatures']
    });

    // Mutation untuk menolak freelancer - gunakan RejectRequest bukan void
    const rejectFreelancer = useMutation<ProjectFeature, RejectRequest>({
        endpoint: 'projectfeatures',
        method: 'DELETE',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data
            refetchFeatures();
            Alert.alert('Sukses', 'Freelancer berhasil ditolak');
            setActionLoading(null);
        },
        invalidateQueries: ['projectfeatures']
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
    };

    const handleAcceptFreelancer = (featureId: string) => {
        setActionLoading(featureId);
        acceptFreelancer.mutate({ 
            status: 'in progress',
            customEndpoint: `projectfeatures/${featureId}`
        });
    };

    const handleRejectFreelancer = (featureId: string) => {
        setActionLoading(featureId);
        rejectFreelancer.mutate({ 
            customEndpoint: `projectfeatures/${featureId}`
        });
    };

    const renderApplicant = ({ item }: { item: ProjectFeature }) => {
        const freelancer = item.freelancer;
        if (!freelancer) return null;
        
        return (
            <View style={styles.applicantCard}>
                <View style={styles.applicantHeader}>
                    <Image 
                        source={{ 
                            uri: freelancer.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(freelancer.fullName) 
                        }} 
                        style={styles.applicantAvatar} 
                    />
                    <View style={styles.applicantInfo}>
                        <Text style={styles.applicantName}>{freelancer.fullName}</Text>
                        <View style={styles.ratingContainer}>
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.ratingText}>
                                {freelancer.rating ? freelancer.rating.toFixed(1) : '0.0'}
                            </Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.applicantDetails}>
                    <View style={styles.detailItem}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{freelancer.location || 'Lokasi tidak tersedia'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.detailText}>Applied {formatDate(item.createdAt)}</Text>
                    </View>
                </View>
                
                {item.content && item.content.length > 0 && (
                    <Text style={styles.coverLetter}>
                        {item.content[0].description || 'Tidak ada deskripsi'}
                    </Text>
                )}
                
                {item.status === 'pending' ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleRejectFreelancer(item._id)}
                            disabled={actionLoading === item._id}
                        >
                            {actionLoading === item._id ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <XCircle size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Tolak</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleAcceptFreelancer(item._id)}
                            disabled={actionLoading === item._id}
                        >
                            {actionLoading === item._id ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <CheckCircle size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Terima</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => navigation.navigate("WorkspaceDetails", { projectId, freelancerId: freelancer._id })}
                    >
                        <Text style={styles.viewButtonText}>Lihat Detail</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const isLoading = projectLoading || featuresLoading || usersLoading;
    const error = projectError || featuresError || usersError;

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>{(error as Error).message || "Terjadi kesalahan"}</Text>
                <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => {
                        refetchProject();
                        refetchFeatures();
                        refetchUsers();
                    }}
                >
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pilih Freelancer</Text>
                <View style={{ width: 24 }} />
            </View>
            
            <View style={styles.projectInfoContainer}>
                <Text style={styles.projectTitle}>{project?.title || 'Project'}</Text>
                <View style={styles.budgetContainer}>
                    <DollarSign size={18} color="#059669" />
                    <Text style={styles.budgetText}>${project?.budget || 0}</Text>
                </View>
                <Text style={styles.applicantsCount}>{applicants.length} Pelamar</Text>
            </View>

            {applicants.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Belum ada freelancer yang melamar project ini.</Text>
                </View>
            ) : (
                <FlatList
                    data={applicants}
                    renderItem={renderApplicant}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={() => {
                        refetchProject();
                        refetchFeatures();
                        refetchUsers();
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    projectInfoContainer: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    budgetContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    budgetText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#059669",
        marginLeft: 4,
    },
    applicantsCount: {
        fontSize: 14,
        color: "#6B7280",
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    applicantCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    applicantHeader: {
        flexDirection: "row",
        marginBottom: 12,
    },
    applicantAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    applicantInfo: {
        justifyContent: "center",
    },
    applicantName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#4B5563",
    },
    applicantDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#6B7280",
    },
    coverLetter: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        flex: 0.48,
    },
    acceptButton: {
        backgroundColor: "#10B981",
    },
    rejectButton: {
        backgroundColor: "#EF4444",
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 8,
    },
    viewButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
        marginBottom: 16,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
});