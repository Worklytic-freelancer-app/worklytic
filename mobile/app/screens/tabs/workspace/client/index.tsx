import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Users, Plus } from "lucide-react-native";
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
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Project {
    _id: string;
    title: string;
    budget: number;
    createdAt: string;
    status: string;
    image: string[];
    featuresCount?: number;
    features?: ProjectFeature[];
    client?: {
        _id: string;
        fullName: string;
        profileImage?: string;
    };
}

export default function ClientWorkspace() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const { user } = useUser();

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        if (!user?._id) return;
        
        try {
            setLoading(true);
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            const response = await fetch(`${baseUrl}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Filter proyek yang dimiliki oleh client yang sedang login
                const clientProjects = Array.isArray(result.data) 
                    ? result.data.filter((project: Project) => project.client?._id === user._id)
                    : [];
                setProjects(clientProjects);
            } else {
                throw new Error(result.message || 'Gagal mengambil data proyek');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        
        // Reset jam untuk perbandingan tanggal saja
        const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Hitung selisih dalam hari
        const diffTime = Math.abs(nowWithoutTime.getTime() - dateWithoutTime.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'today';
        } else if (diffDays === 1) {
            // Cek apakah kemarin atau besok
            return dateWithoutTime < nowWithoutTime ? 'yesterday' : 'tomorrow';
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open':
                return {
                    bg: '#ecfdf5',
                    text: '#059669'
                };
            case 'in progress':
                return {
                    bg: '#eff6ff',
                    text: '#3b82f6'
                };
            case 'completed':
                return {
                    bg: '#f3f4f6',
                    text: '#4b5563'
                };
            default:
                return {
                    bg: '#f3f4f6',
                    text: '#4b5563'
                };
        }
    };

    const renderProject = ({ item }: { item: Project }) => {
        const statusColor = getStatusColor(item.status);
        const featuresCount = item.featuresCount || (item.features?.length || 0);
        
        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => navigation.navigate('ChooseFreelancer', { projectId: item._id })}
            >
                <Image
                    source={{ 
                        uri: item.image && item.image.length > 0 
                            ? item.image[0] 
                            : 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d' 
                    }}
                    style={styles.projectImage}
                    resizeMode="cover"
                />
                <View style={styles.projectInfo}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                            <Text style={[styles.statusText, { color: statusColor.text }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.projectBudget}>
                        Rp {item.budget.toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.projectMeta}>
                        <View style={styles.metaItem}>
                            <Clock size={16} color="#6b7280" />
                            <Text style={styles.metaText}>
                                Posted {formatDate(item.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Users size={16} color="#6b7280" />
                            <Text style={styles.metaText}>
                                {featuresCount} {featuresCount === 1 ? 'freelancer' : 'freelancers'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Workspace</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('PostProject')}
                >
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            
            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Kamu belum memiliki proyek. Buat proyek baru untuk mulai mencari freelancer.
                    </Text>
                    <TouchableOpacity 
                        style={styles.postProjectButton}
                        onPress={() => navigation.navigate('PostProject')}
                    >
                        <Text style={styles.postProjectButtonText}>Buat Proyek Baru</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderProject}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.projectList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    addButton: {
        backgroundColor: "#2563eb",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    projectList: {
        padding: 16,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
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
    projectMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaText: {
        fontSize: 13,
        color: "#6b7280",
        marginLeft: 4,
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
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    postProjectButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    postProjectButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
});