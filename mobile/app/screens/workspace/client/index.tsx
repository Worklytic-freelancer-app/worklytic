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

// Tambahkan interface untuk data project dari API
interface ProjectResponse {
    _id: string;
    clientId: string;
    title: string;
    budget: number;
    createdAt: string;
    assignedFreelancer?: Array<{
        _id: string;
        fullName: string;
        profileImage: string;
        email: string;
        role: string;
    }>;
    image: string[];
    status: string;
}

interface PostedProject {
    _id: string;
    title: string;
    budget: string; // Diubah ke string karena sudah diformat
    createdAt: string;
    assignedFreelancer?: Array<{
        _id: string;
        fullName: string;
        profileImage: string;
        email: string;
        role: string;
    }>;
    image: string[];
    status: "open" | "in-progress" | "completed"; // Definisikan status yang valid
}

export default function ClientWorkspace() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [postedProjects, setPostedProjects] = useState<PostedProject[]>([]);
    const { user } = useUser();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const token = await SecureStoreUtils.getToken();
                
                const response = await fetch(`${baseUrl}/api/projects`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    // Filter proyek berdasarkan clientId yang sama dengan user._id
                    const filteredProjects = (result.data as ProjectResponse[]).filter((project) => 
                        project.clientId === user?._id
                    );
                    
                    // Transform data untuk menyesuaikan dengan interface PostedProject
                    const transformedProjects: PostedProject[] = filteredProjects.map((project) => ({
                        _id: project._id,
                        title: project.title,
                        budget: new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(project.budget),
                        createdAt: new Date(project.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }),
                        assignedFreelancer: project.assignedFreelancer,
                        image: project.image,
                        status: project.status.toLowerCase() as PostedProject["status"]
                    }));
                    
                    setPostedProjects(transformedProjects);
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : "Gagal mengambil data proyek");
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchProjects();
        }
    }, [user?._id]);

    const getStatusColor = (status: PostedProject["status"]) => {
        switch (status) {
            case "open":
                return "#10b981";
            case "in-progress":
                return "#f59e0b";
            case "completed":
                return "#6b7280";
            default:
                return "#6b7280";
        }
    };

    const renderProject = ({ item }: { item: PostedProject }) => (
        <TouchableOpacity 
            style={styles.projectCard} 
            onPress={() => navigation.navigate("ChooseFreelancer", { projectId: item._id })}
        >
            <Image 
                source={{ uri: item.image[0] || 'https://via.placeholder.com/300' }} 
                style={styles.projectImage} 
            />
            <View style={styles.projectInfo}>
                <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status === "in-progress" ? "In Progress" : 
                             item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.projectBudget}>{item.budget}</Text>
                <View style={styles.projectMeta}>
                    <View style={styles.metaItem}>
                        <Clock size={16} color="#6b7280" />
                        <Text style={styles.metaText}>Posted {item.createdAt}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Users size={16} color="#6b7280" />
                        <Text style={styles.metaText}>
                            {item.assignedFreelancer?.length || 0} Applicants
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
                    <Text style={styles.headerTitle}>My Posted Projects</Text>
                    <TouchableOpacity 
                        style={styles.postButton}
                        onPress={() => navigation.navigate("PostProject")}
                    >
                        <Plus size={20} color="#ffffff" />
                    </TouchableOpacity>
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
                    <Text style={styles.headerTitle}>My Posted Projects</Text>
                    <TouchableOpacity 
                        style={styles.postButton}
                        onPress={() => navigation.navigate("PostProject")}
                    >
                        <Plus size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Posted Projects</Text>
                <TouchableOpacity 
                    style={styles.postButton}
                    onPress={() => navigation.navigate("PostProject")}
                >
                    <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <FlatList<PostedProject> 
                data={postedProjects} 
                renderItem={renderProject} 
                keyExtractor={(item) => item._id} 
                contentContainerStyle={styles.projectsList} 
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Kamu belum memposting proyek</Text>
                        <TouchableOpacity 
                            style={styles.postProjectButton}
                            onPress={() => navigation.navigate("PostProject")}
                        >
                            <Text style={styles.postProjectButtonText}>Post Project</Text>
                        </TouchableOpacity>
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
    postButton: {
        backgroundColor: "#2563eb",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
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