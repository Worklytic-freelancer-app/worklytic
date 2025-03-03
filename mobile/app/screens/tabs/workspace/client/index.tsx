import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Users, Plus, Calendar } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/tanstack/useUser";
import { useFetch } from "@/hooks/tanstack/useFetch";
import Header from "@/components/Header";
import { COLORS } from "@/constant/color";

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
    const { data: user, isLoading: userLoading } = useUser();

    // Gunakan useFetch untuk mendapatkan data proyek
    const { 
        data: allProjects = [], 
        isLoading: loading, 
        error,
        refetch: fetchProjects
    } = useFetch<Project[]>({
        endpoint: 'projects',
        requiresAuth: true
    });

    // Filter proyek yang dimiliki oleh client yang sedang login
    const projects = allProjects.filter(project => project.client?._id === user?._id);

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
            return 'Today';
        } else if (diffDays === 1) {
            // Cek apakah kemarin atau besok
            return dateWithoutTime < nowWithoutTime ? 'Yesterday' : 'Tomorrow';
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
                    bg: 'rgba(16, 185, 129, 0.08)',
                    text: COLORS.success
                };
            case 'in progress':
                return {
                    bg: 'rgba(59, 130, 246, 0.08)',
                    text: '#3b82f6'
                };
            case 'completed':
                return {
                    bg: 'rgba(107, 114, 128, 0.08)',
                    text: COLORS.darkGray
                };
            default:
                return {
                    bg: 'rgba(107, 114, 128, 0.08)',
                    text: COLORS.darkGray
                };
        }
    };

    const renderProject = ({ item }: { item: Project }) => {
        const statusColor = getStatusColor(item.status);
        const featuresCount = item.featuresCount || (item.features?.length || 0);
        
        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => navigation.navigate('WorkspaceDetails', { projectId: item._id })}
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
                        Rp{item.budget.toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.projectMeta}>
                        <View style={styles.metaItem}>
                            <Calendar size={16} color={COLORS.gray} />
                            <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Users size={16} color={COLORS.gray} />
                            <Text style={styles.metaText}>{featuresCount} freelancers</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const AddButton = () => (
        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('PostProject')}
        >
            <Plus size={20} color={COLORS.background} strokeWidth={2.5} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>
                    {(error as Error).message || "Terjadi kesalahan saat memuat data"}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchProjects()}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header 
                title="Workspace" 
                rightComponent={<AddButton />}
                onRightComponentPress={() => navigation.navigate('Notifications')}
            />
            
            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076478.png' }}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyTitle}>Belum Ada Proyek</Text>
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
                    onRefresh={fetchProjects}
                    refreshing={loading}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    projectList: {
        padding: 20,
    },
    projectCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    projectImage: {
        width: "100%",
        height: 160,
    },
    projectInfo: {
        padding: 16,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    projectTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    projectBudget: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.success,
        marginBottom: 16,
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
        fontSize: 14,
        color: COLORS.gray,
        marginLeft: 6,
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
    retryButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyImage: {
        width: 120,
        height: 120,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.black,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    postProjectButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    postProjectButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
});