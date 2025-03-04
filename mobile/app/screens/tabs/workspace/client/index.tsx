import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Alert } from "react-native";
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
import { useState } from "react";
import Confirmation from "@/components/Confirmation";

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

    const handleCloseOptions = () => {
        setShowOptions(false);
        setSelectedProject(null);
    };

    const handleViewDetails = (projectId: string) => {
        setDropdownVisible(null);
        
        // Pastikan projectId valid sebelum navigasi
        if (projectId && projectId.length === 24) {
            navigation.navigate('ProjectDetails', { 
                projectId,
                clientId: user?._id // Tambahkan clientId jika diperlukan oleh ProjectDetails
            });
        } else {
            // Tampilkan pesan error jika ID tidak valid
            setConfirmation({
                visible: true,
                title: 'Error',
                message: 'ID proyek tidak valid. Silakan coba lagi nanti.',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
        }
    };

    const handleDeleteProject = (projectId: string) => {
        setDropdownVisible(null);
        setConfirmation({
            visible: true,
            title: 'Hapus Proyek',
            message: 'Apakah kamu yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            onConfirm: () => confirmDeleteProject(projectId),
        });
    };
    
    const confirmDeleteProject = (projectId: string) => {
        setConfirmation(prev => ({ ...prev, visible: false }));
        
        // Gunakan customEndpoint untuk mengarahkan ke endpoint yang benar
        const endpoint = `projects/${projectId}`;
        console.log("DELETE request to endpoint:", endpoint);
        
        deleteProject(
            { customEndpoint: endpoint },
            {
                onSuccess: (data) => {
                    console.log("Delete success response:", data);
                    setConfirmation({
                        visible: true,
                        title: 'Berhasil',
                        message: 'Proyek berhasil dihapus',
                        type: 'success',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                    });
                },
                onError: (error) => {
                    console.error("Delete error:", error);
                    setConfirmation({
                        visible: true,
                        title: 'Gagal',
                        message: error.message || "Gagal menghapus proyek",
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
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => navigation.navigate('ChooseFreelancer', { projectId: item._id })}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ 
                                    uri: item.image && item.image.length > 0 
                                        ? item.image[0] 
                                        : 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d' 
                                }}
                                style={styles.projectImage}
                                resizeMode="cover"
                            />
                        </View>
                        
                        <View style={styles.projectInfo}>
                            <Text style={styles.projectTitle} numberOfLines={2}>
                                {item.title}
                            </Text>
                            
                            <Text style={styles.projectBudget}>
                                Rp{item.budget.toLocaleString('id-ID')}
                            </Text>
                            
                            <View style={styles.projectMeta}>
                                <View style={styles.metaItem}>
                                    <Calendar size={14} color={COLORS.gray} />
                                    <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Users size={14} color={COLORS.gray} />
                                    <Text style={styles.metaText}>{featuresCount}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.rightContainer}>
                            <View style={styles.moreButtonContainer}>
                                <TouchableOpacity 
                                    style={styles.moreButton}
                                    onPress={() => handleMoreOptions(item._id)}
                                >
                                    <MoreVertical size={18} color={COLORS.gray} />
                                </TouchableOpacity>
                                
                                {dropdownVisible === item._id && (
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
                                            disabled={isDeleting}
                                        >
                                            <Trash2 size={16} color={COLORS.error} />
                                            <Text style={[styles.dropdownItemText, {color: COLORS.error}]}>
                                                {isDeleting ? "Menghapus..." : "Hapus"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            
                            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                <Text style={[styles.statusText, { color: statusColor.text }]}>
                                    {item.status}
                                </Text>
                            </View>
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

            <Confirmation
                visible={confirmation.visible}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, visible: false }))}
                loading={isDeleting && confirmation.type === 'warning'}
                confirmText={
                    confirmation.type === 'success' || confirmation.type === 'error' 
                        ? 'OK' 
                        : confirmation.type === 'warning' 
                            ? 'Hapus' 
                            : 'Konfirmasi'
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
    },
    cardContent: {
        padding: 12,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
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
        paddingRight: 12,
    },
    rightContainer: {
        width: 50,
        height: 70,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
    },
    projectBudget: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.success,
        marginBottom: 6,
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
    moreButtonContainer: {
        position: 'relative',
    },
    moreButton: {
        padding: 4,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 30,
        right: 0,
        width: 120,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    dropdownItemText: {
        fontSize: 14,
        marginLeft: 8,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        minWidth: 50,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 10,
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
});