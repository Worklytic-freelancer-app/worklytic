import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign, CheckCircle, XCircle } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

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

export default function ChooseFreelancer() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { projectId } = route.params as { projectId: string };
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<ProjectFeature[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchProjectAndApplicants();
    }, [projectId]);

    const fetchProjectAndApplicants = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            // Fetch project details
            const projectResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!projectResponse.ok) {
                throw new Error(`Error: ${projectResponse.status}`);
            }
            
            const projectResult = await projectResponse.json();
            
            if (!projectResult.success) {
                throw new Error(projectResult.message || 'Gagal mengambil data proyek');
            }
            
            setProject(projectResult.data);
            
            // Fetch project features (applicants)
            const featuresResponse = await fetch(`${baseUrl}/api/projectfeatures`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!featuresResponse.ok) {
                throw new Error(`Error: ${featuresResponse.status}`);
            }
            
            const featuresResult = await featuresResponse.json();
            
            if (!featuresResult.success) {
                throw new Error(featuresResult.message || 'Gagal mengambil data pelamar');
            }
            
            // Filter features for this project
            const projectFeatures = featuresResult.data.filter(
                (feature: ProjectFeature) => feature.projectId === projectId
            );
            
            // Fetch freelancer details for each feature
            const featuresWithFreelancers = await Promise.all(
                projectFeatures.map(async (feature: ProjectFeature) => {
                    try {
                        const userResponse = await fetch(`${baseUrl}/api/users/${feature.freelancerId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (userResponse.ok) {
                            const userResult = await userResponse.json();
                            if (userResult.success) {
                                return {
                                    ...feature,
                                    freelancer: userResult.data
                                };
                            }
                        }
                        return feature;
                    } catch (err) {
                        console.error('Error fetching freelancer details:', err);
                        return feature;
                    }
                })
            );
            
            setApplicants(featuresWithFreelancers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const handleAcceptFreelancer = async (featureId: string) => {
        try {
            setActionLoading(featureId);
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            const response = await fetch(`${baseUrl}/api/projectfeatures/${featureId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'in progress' })
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Gagal menerima freelancer');
            }
            
            // Refresh data
            fetchProjectAndApplicants();
            Alert.alert('Sukses', 'Freelancer berhasil diterima');
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Gagal menerima freelancer');
            console.error('Error accepting freelancer:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectFreelancer = async (featureId: string) => {
        try {
            setActionLoading(featureId);
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            const response = await fetch(`${baseUrl}/api/projectfeatures/${featureId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Gagal menolak freelancer');
            }
            
            // Refresh data
            fetchProjectAndApplicants();
            Alert.alert('Sukses', 'Freelancer berhasil ditolak');
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Gagal menolak freelancer');
            console.error('Error rejecting freelancer:', err);
        } finally {
            setActionLoading(null);
        }
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

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProjectAndApplicants}>
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
                    refreshing={loading}
                    onRefresh={fetchProjectAndApplicants}
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