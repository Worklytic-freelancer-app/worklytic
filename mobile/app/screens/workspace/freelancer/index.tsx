import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, CheckCircle2, XCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useState, useEffect } from "react";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { useUser } from "@/hooks/useUser";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [myProjects, setMyProjects] = useState<ProjectFeature[]>([]);
    const { user } = useUser();

    useEffect(() => {
        if (user?._id) {
            fetchMyProjects();
        }
    }, [user]);

    const fetchMyProjects = async () => {
        if (!user?._id) return;
        
        try {
            setLoading(true);
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            // Ambil semua project features
            const response = await fetch(`${baseUrl}/api/projectfeatures`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Filter project features yang dimiliki oleh freelancer yang sedang login
                const freelancerProjects = Array.isArray(result.data) 
                    ? result.data.filter((feature: ProjectFeature) => feature.freelancerId === user._id)
                    : [];
                
                setMyProjects(freelancerProjects);
            } else {
                throw new Error(result.message || 'Gagal mengambil data project features');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
            console.error('Error fetching project features:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
            return 'today';
        } else if (diffDays < 2) {
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
                projectId: item.projectId,  // Gunakan projectId, bukan _id
                freelancerId: user?._id     // Tambahkan freelancerId
            })}
        >
            <Image 
                source={{ 
                    uri: item.project?.image && item.project.image.length > 0 
                        ? item.project.image[0] 
                        : "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60" 
                }} 
                style={styles.projectImage} 
            />
            <View style={styles.projectInfo}>
                <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{item.project?.title || "Untitled Project"}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                        {getStatusIcon(item.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusDisplay(item.status)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.projectBudget}>
                    ${item.project?.budget ? item.project.budget.toLocaleString() : "N/A"}
                </Text>
                <View style={styles.companyInfo}>
                    <Image 
                        source={{ 
                            uri: item.project?.client?.profileImage || 
                                "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60" 
                        }} 
                        style={styles.companyImage} 
                    />
                    <View>
                        <Text style={styles.companyName}>
                            {item.project?.client?.fullName || "Unknown Client"}
                        </Text>
                        <Text style={styles.appliedDate}>
                            Applied {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Projects</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Projects</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchMyProjects}>
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
                refreshing={loading}
                onRefresh={fetchMyProjects}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Kamu belum memiliki proyek</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
    },
    projectsList: {
        padding: 20,
    },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    projectImage: {
        width: "100%",
        height: 140,
    },
    projectInfo: {
        padding: 16,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    projectTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginRight: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    projectBudget: {
        fontSize: 16,
        fontWeight: "600",
        color: "#059669",
        marginBottom: 12,
    },
    companyInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    companyImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    companyName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    appliedDate: {
        fontSize: 12,
        color: "#6b7280",
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
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
});