import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Users, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useState, useEffect } from "react";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface PostedProject {
    id: number;
    title: string;
    budget: string;
    postedDate: string;
    applicants: number;
    image: string;
    status: "open" | "in-progress" | "completed";
}

export default function ClientWorkspace() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [postedProjects, setPostedProjects] = useState<PostedProject[]>([]);

    useEffect(() => {
        // Untuk sementara menggunakan data dummy
        // Nanti bisa diganti dengan fetch dari API
        setPostedProjects([
            {
                id: 1,
                title: "E-commerce Website Development",
                budget: "$3,500",
                postedDate: "3 days ago",
                applicants: 8,
                image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
                status: "open",
            },
            {
                id: 2,
                title: "Mobile App UI/UX Design",
                budget: "$1,200",
                postedDate: "1 week ago",
                applicants: 5,
                image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60",
                status: "in-progress",
            },
            {
                id: 3,
                title: "Content Writing for Blog",
                budget: "$800",
                postedDate: "2 weeks ago",
                applicants: 12,
                image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60",
                status: "completed",
            },
        ]);
    }, []);

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
            onPress={() => navigation.navigate("ChooseFreelancer", { projectId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.projectImage} />
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
                        <Text style={styles.metaText}>Posted {item.postedDate}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Users size={16} color="#6b7280" />
                        <Text style={styles.metaText}>{item.applicants} Applicants</Text>
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
                keyExtractor={(item) => item.id.toString()} 
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