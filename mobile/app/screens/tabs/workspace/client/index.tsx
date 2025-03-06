import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, Dimensions, TouchableWithoutFeedback, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Users, Plus, Calendar, MoreVertical, Edit2, Trash2, Info } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/tanstack/useUser";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";
import Header from "@/components/Header";
import { COLORS } from "@/constant/color";
import { useState, useEffect, useCallback } from "react";
import Confirmation from "@/components/Confirmation";
import Loading from "@/components/Loading";
import SkeletonProject from "./SkeletonProject";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

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

    // State untuk refresh control
    const [refreshing, setRefreshing] = useState(false);

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

    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);

    // Tambahkan mutation untuk delete project
    const { mutate: deleteProject, isPending: isDeleting } = useMutation<Record<string, unknown>, { customEndpoint: string }>({
        endpoint: 'projects',
        method: 'DELETE',
        invalidateQueries: ['projects'],
    });

    // State untuk konfirmasi
    const [confirmation, setConfirmation] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'confirm';
        onConfirm?: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'confirm',
    });
    
    // Ubah state untuk dropdown
    const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);

    // Fetch features
    const { 
        data: features = [], 
        isLoading: featuresLoading,
        error: featuresError,
        refetch: refetchFeatures
    } = useFetch<ProjectFeature[]>({
        endpoint: 'projectfeatures',
        requiresAuth: true,
    });

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchProjects(),
            refetchFeatures()
        ]);
        setRefreshing(false);
    }, [fetchProjects, refetchFeatures]);

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
                    bg: 'rgba(8, 145, 178, 0.08)',
                    text: COLORS.primary
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

    const handleMoreOptions = (projectId: string) => {
        // Toggle dropdown
        setDropdownVisible(dropdownVisible === projectId ? null : projectId);
    };

    const handleProjectPress = (projectId: string) => {
        // Validasi ID sebelum navigasi
        if (projectId && projectId.length === 24) {
            // Pastikan projectId adalah string
            navigation.navigate('ChooseFreelancer', { 
                projectId: projectId.toString() 
            });
        } else {
            console.error("Invalid projectId format:", projectId);
            setConfirmation({
                visible: true,
                title: 'Error',
                message: 'Invalid project ID. Please try again later.',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
        }
    };

    const handleViewDetails = (projectId: string) => {
        setDropdownVisible(null);
        
        // Validasi ID sebelum navigasi
        if (projectId && projectId.length === 24) {
            // Pastikan projectId adalah string
            navigation.navigate('ProjectDetails', { 
                projectId: projectId.toString(),
                clientId: user?._id?.toString() // Pastikan clientId juga string
            });
        } else {
            console.error("Invalid projectId format:", projectId);
            setConfirmation({
                visible: true,
                title: 'Error',
                message: 'Invalid project ID. Please try again later.',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
        }
    };

    const handleDeleteProject = (projectId: string) => {
        setDropdownVisible(null);
        setConfirmation({
            visible: true,
            title: 'Delete Project',
            message: 'Are you sure you want to delete this project? This action cannot be undone.',
            type: 'warning',
            onConfirm: () => confirmDeleteProject(projectId),
        });
    };
    
    const confirmDeleteProject = (projectId: string) => {
        setConfirmation(prev => ({ ...prev, visible: false }));
        
        // Gunakan customEndpoint untuk mengarahkan ke endpoint yang benar
        const endpoint = `projects/${projectId.toString()}`;
        console.log("DELETE request to endpoint:", endpoint);
        
        deleteProject(
            { customEndpoint: endpoint },
            {
                onSuccess: (data) => {
                    setConfirmation({
                        visible: true,
                        title: 'Success',
                        message: 'Project has been deleted',
                        type: 'success',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                    });
                },
                onError: (error) => {
                    console.error("Delete error:", error);
                    setConfirmation({
                        visible: true,
                        title: 'Error',
                        message: error.message || "Failed to delete project",
                        type: 'error',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                    });
                }
            }
        );
    };

    const renderProject = ({ item }: { item: Project }) => {
        const statusColor = getStatusColor(item.status);
        const featuresCount = item.featuresCount || (item.features?.length || 0);
        
        return (
            <View style={styles.projectCard}>
                <TouchableOpacity 
                    style={styles.cardTouchable}
                    onPress={() => handleProjectPress(item._id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardContent}>
                        <TouchableOpacity 
                            style={styles.moreButton}
                            onPress={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling
                                handleMoreOptions(item._id);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MoreVertical size={18} color={COLORS.darkGray} />
                        </TouchableOpacity>
                        
                        <View style={styles.cardRow}>
                            <View style={styles.imageContainer}>
                                <ImageWithSkeleton
                                    source={{ uri: item.image?.[0] || 'https://via.placeholder.com/70' }}
                                    style={styles.projectImage}
                                />
                            </View>
                            <View style={styles.projectInfo}>
                                <Text style={styles.projectTitle} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.projectBudget}>Rp{item.budget.toLocaleString('id-ID')}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.cardFooter}>
                            <View style={styles.projectMeta}>
                                <View style={styles.metaItem}>
                                    <Calendar size={12} color={COLORS.gray} />
                                    <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Users size={12} color={COLORS.gray} />
                                    <Text style={styles.metaText}>{featuresCount} Applicant</Text>
                                </View>
                            </View>
                            
                            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                <Text style={[styles.statusText, { color: statusColor.text }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                
                {dropdownVisible === item._id && (
                    <TouchableWithoutFeedback onPress={() => setDropdownVisible(null)}>
                        <View style={styles.dropdownMenuWrapper}>
                            <TouchableWithoutFeedback>
                                <View style={styles.dropdownMenu}>
                                    <TouchableOpacity 
                                        style={styles.dropdownItem}
                                        onPress={() => handleViewDetails(item._id)}
                                    >
                                        <Info size={16} color={COLORS.primary} />
                                        <Text style={styles.dropdownItemText}>Detail</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                        onPress={() => handleDeleteProject(item._id)}
                                    >
                                        <Trash2 size={16} color={COLORS.error} />
                                        <Text style={[styles.dropdownItemText, { color: COLORS.error }]}>Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        );
    };

    // Render loading state
    if (userLoading) {
        return <Loading />;
    }
    
    return (
        <View 
            style={[styles.container, { paddingTop: insets.top }]}
            onStartShouldSetResponder={() => {
                if (dropdownVisible) {
                    setDropdownVisible(null);
                    return true;
                }
                return false;
            }}
        >
            <Header 
                title="Workspace" 
                rightComponent={
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => navigation.navigate('PostProject')}
                    >
                        <Plus size={20} color={COLORS.background} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <SkeletonProject />
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error.message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchProjects()}>
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            ) : projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No Projects</Text>
                    <Text style={styles.emptyText}>
                        You don't have any projects yet. Start by creating a new project to find the best freelancer.
                    </Text>
                    <TouchableOpacity 
                        style={styles.postProjectButton}
                        onPress={() => navigation.navigate('PostProject')}
                    >
                        <Text style={styles.postProjectButtonText}>Create New Project</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderProject}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.projectList}
                    onScrollBeginDrag={() => setDropdownVisible(null)}
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

            <Confirmation
                visible={confirmation.visible}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={confirmation.onConfirm}
                confirmText={
                    confirmation.type === 'warning' 
                        ? 'Hapus' 
                        : confirmation.type === 'success' 
                            ? 'OK' 
                            : 'Konfirmasi'
                }
            />
        </View>
    );
}

const { width } = Dimensions.get('window');

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
        position: 'relative',
    },
    cardContent: {
        padding: 12,
        position: 'relative',
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        paddingRight: 24,
    },
    imageContainer: {
        width: 80,
        height: 80,
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
    moreButton: {
        padding: 8,
        position: 'absolute',
        right: 4,
        top: 4,
        zIndex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
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
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        minWidth: 60,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
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
    dropdownMenuWrapper: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 100,
        width: width,
        height: '100%',
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 30,
        right: 12,
        width: 150,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    dropdownItemText: {
        fontSize: 14,
        marginLeft: 12,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
        lineHeight: 22,
    },
    projectBudget: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.success,
        marginBottom: 6,
    },
    cardTouchable: {
        borderRadius: 12,
        overflow: 'hidden',
    },
});