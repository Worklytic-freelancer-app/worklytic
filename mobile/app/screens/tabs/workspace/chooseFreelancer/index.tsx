import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign, MoreVertical, Check, X, CheckSquare, MessageSquare, Users } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";
import Confirmation from "@/components/Confirmation";
import { COLORS } from "@/constant/color";

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
    
    const [actionType, setActionType] = useState<{ id: string | null, type: 'accept' | 'reject' | null }>({ id: null, type: null });

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
    const acceptFreelancer = useMutation<ProjectFeature, Record<string, unknown>>({
        endpoint: 'projectfeatures',
        method: 'PATCH',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data
            refetchFeatures();
            // Ganti Alert dengan Confirmation
            setConfirmation({
                visible: true,
                title: 'Berhasil',
                message: 'Freelancer berhasil diterima untuk mengerjakan proyek.',
                type: 'success',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
            setActionType({ id: null, type: null });
        },
        invalidateQueries: ['projectfeatures']
    });

    // Mutation untuk menolak freelancer
    const rejectFreelancer = useMutation<ProjectFeature, Record<string, unknown>>({
        endpoint: 'projectfeatures',
        method: 'DELETE',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data
            refetchFeatures();
            // Ganti Alert dengan Confirmation
            setConfirmation({
                visible: true,
                title: 'Berhasil',
                message: 'Freelancer berhasil ditolak.',
                type: 'success',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
            setActionType({ id: null, type: null });
        },
        invalidateQueries: ['projectfeatures']
    });

    // Tambahkan mutation untuk menandai proyek sebagai selesai
    const markAsCompleted = useMutation<ProjectFeature, Record<string, unknown>>({
        endpoint: 'projectfeatures',
        method: 'PATCH',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data
            refetchFeatures();
            // Tampilkan konfirmasi
            setConfirmation({
                visible: true,
                title: 'Berhasil',
                message: 'Proyek berhasil ditandai sebagai selesai.',
                type: 'success',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
            setActionType({ id: null, type: null });
        },
        invalidateQueries: ['projectfeatures']
    });

    // State untuk modal konfirmasi
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
    
    // State untuk menyimpan ID feature yang akan diproses
    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

    // State untuk dropdown menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        setSelectedFeatureId(featureId);
        setConfirmation({
            visible: true,
            title: 'Terima Freelancer',
            message: 'Apakah kamu yakin ingin menerima freelancer ini untuk mengerjakan proyek?',
            type: 'confirm',
            onConfirm: () => confirmAcceptFreelancer(featureId),
        });
    };
    
    const confirmAcceptFreelancer = (featureId: string) => {
        setActionType({ id: featureId, type: 'accept' });
        setConfirmation(prev => ({ ...prev, visible: false }));
        
        acceptFreelancer.mutate({ 
            status: 'in progress',
            customEndpoint: `projectfeatures/${featureId}`
        }, {
            onSuccess: () => {
                refetchFeatures();
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Berhasil',
                    message: 'Freelancer berhasil diterima untuk mengerjakan proyek.',
                    type: 'success',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            },
            onError: () => {
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Gagal',
                    message: 'Terjadi kesalahan saat menerima freelancer. Silakan coba lagi.',
                    type: 'error',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            }
        });
    };
    
    const handleRejectFreelancer = (featureId: string) => {
        setSelectedFeatureId(featureId);
        setConfirmation({
            visible: true,
            title: 'Tolak Freelancer',
            message: 'Apakah kamu yakin ingin menolak freelancer ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            onConfirm: () => confirmRejectFreelancer(featureId),
        });
    };
    
    const confirmRejectFreelancer = (featureId: string) => {
        setActionType({ id: featureId, type: 'reject' });
        setConfirmation(prev => ({ ...prev, visible: false }));
        
        rejectFreelancer.mutate({ 
            customEndpoint: `projectfeatures/${featureId}`
        }, {
            onSuccess: () => {
                refetchFeatures();
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Berhasil',
                    message: 'Freelancer berhasil ditolak.',
                    type: 'success',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            },
            onError: () => {
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Gagal',
                    message: 'Terjadi kesalahan saat menolak freelancer. Silakan coba lagi.',
                    type: 'error',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            }
        });
    };

    // Fungsi untuk menandai proyek sebagai selesai
    const handleMarkAsCompleted = (featureId: string) => {
        setSelectedFeatureId(featureId);
        setConfirmation({
            visible: true,
            title: 'Tandai Selesai',
            message: 'Apakah kamu yakin ingin menandai proyek ini sebagai selesai?',
            type: 'confirm',
            onConfirm: () => confirmMarkAsCompleted(featureId),
        });
    };
    
    const confirmMarkAsCompleted = (featureId: string) => {
        setActionType({ id: featureId, type: 'accept' });
        setConfirmation(prev => ({ ...prev, visible: false }));
        
        markAsCompleted.mutate({ 
            status: 'completed',
            customEndpoint: `projectfeatures/${featureId}`
        }, {
            onSuccess: () => {
                refetchFeatures();
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Berhasil',
                    message: 'Proyek berhasil ditandai sebagai selesai.',
                    type: 'success',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            },
            onError: () => {
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Gagal',
                    message: 'Terjadi kesalahan saat menandai proyek sebagai selesai. Silakan coba lagi.',
                    type: 'error',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            }
        });
    };

    const renderApplicant = ({ item }: { item: ProjectFeature }) => {
        const freelancer = item.freelancer;
        if (!freelancer) return null;
        
        const isRejectLoading = actionType.id === item._id && actionType.type === 'reject';
        const isAcceptLoading = actionType.id === item._id && actionType.type === 'accept';
        const isMenuOpen = openMenuId === item._id;
        
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
                    
                    {/* Menu dropdown dengan titik tiga */}
                    <View style={styles.menuContainer}>
                        <TouchableOpacity 
                            style={styles.menuButton}
                            onPress={() => setOpenMenuId(isMenuOpen ? null : item._id)}
                        >
                            <MoreVertical size={20} color={COLORS.darkGray} />
                        </TouchableOpacity>
                        
                        {isMenuOpen && (
                            <View style={styles.dropdownMenu}>
                                {item.status === 'pending' && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                handleAcceptFreelancer(item._id);
                                            }}
                                        >
                                            <Check size={18} color={COLORS.success} />
                                            <Text style={[styles.menuItemText, { color: COLORS.success }]}>Terima</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                handleRejectFreelancer(item._id);
                                            }}
                                        >
                                            <X size={18} color={COLORS.error} />
                                            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Tolak</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                {item.status === 'in progress' && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                handleMarkAsCompleted(item._id);
                                            }}
                                        >
                                            <CheckSquare size={18} color={COLORS.success} />
                                            <Text style={[styles.menuItemText, { color: COLORS.success }]}>Tandai Selesai</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                navigation.navigate("WorkspaceDetails", { projectId, freelancerId: freelancer._id });
                                            }}
                                        >
                                            <MessageSquare size={18} color={COLORS.primary} />
                                            <Text style={[styles.menuItemText, { color: COLORS.primary }]}>Lihat Detail</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                handleRejectFreelancer(item._id);
                                            }}
                                        >
                                            <X size={18} color={COLORS.error} />
                                            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Hapus</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                {item.status === 'completed' && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                navigation.navigate("WorkspaceDetails", { projectId, freelancerId: freelancer._id });
                                            }}
                                        >
                                            <MessageSquare size={18} color={COLORS.primary} />
                                            <Text style={[styles.menuItemText, { color: COLORS.primary }]}>Lihat Detail</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setOpenMenuId(null);
                                                handleRejectFreelancer(item._id);
                                            }}
                                        >
                                            <X size={18} color={COLORS.error} />
                                            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Hapus</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        )}
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
                            disabled={actionType.id === item._id}
                        >
                            {isRejectLoading ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Text style={styles.rejectButtonText}>Tolak</Text>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleAcceptFreelancer(item._id)}
                            disabled={actionType.id === item._id}
                        >
                            {isAcceptLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.acceptButtonText}>Terima</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.viewButtonFull}
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

    // Render konten utama
    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error?.message || "Terjadi kesalahan saat memuat data"}
                    </Text>
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

        if (applicants.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Users size={40} color={COLORS.lightGray} />
                    </View>
                    <Text style={styles.emptyTitle}>Belum Ada Pelamar</Text>
                    <Text style={styles.emptyText}>
                        Belum ada freelancer yang melamar untuk proyek ini. 
                        Tunggu beberapa saat atau coba perbarui detail proyek untuk menarik lebih banyak pelamar.
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={applicants}
                renderItem={renderApplicant}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.applicantsList}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pilih Freelancer</Text>
                <View style={{ width: 24 }} />
            </View>
            
            {project && (
                <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectBudget}>
                        <DollarSign size={16} color={COLORS.success} /> 
                        {project.budget.toLocaleString('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
                    </Text>
                </View>
            )}
            
            {renderContent()}
            
            <Confirmation
                visible={confirmation.visible}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, visible: false }))}
                confirmText={
                    confirmation.type === 'success' 
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    applicantHeader: {
        flexDirection: "row",
        marginBottom: 16,
        position: "relative",
        alignItems: "center",
    },
    applicantAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 2,
        borderColor: 'rgba(8, 145, 178, 0.2)',
    },
    applicantInfo: {
        justifyContent: "center",
        flex: 1,
    },
    applicantName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
    },
    applicantDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        padding: 12,
        borderRadius: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        marginLeft: 6,
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "500",
    },
    coverLetter: {
        fontSize: 15,
        color: "#4B5563",
        lineHeight: 22,
        marginBottom: 20,
        backgroundColor: 'rgba(243, 244, 246, 0.4)',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#0891b2',
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
        gap: 12,
    },
    actionButton: {
        paddingVertical: 12,
        borderRadius: 12,
        flex: 0.48,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    acceptButton: {
        backgroundColor: "#0891b2",
    },
    rejectButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    acceptButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    rejectButtonText: {
        color: "#EF4444",
        fontSize: 16,
        fontWeight: "600",
    },
    viewButton: {
        backgroundColor: COLORS.primary,
    },
    viewButtonFull: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 8,
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
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
        backgroundColor: "#0891b2",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: "#0891b2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
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
    applicantsList: {
        padding: 16,
        paddingTop: 8,
    },
    projectInfo: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    projectBudget: {
        fontSize: 18,
        fontWeight: "600",
        color: "#059669",
        marginTop: 8,
    },
    menuContainer: {
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 5,
    },
    menuButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
    },
    dropdownMenu: {
        position: "absolute",
        right: 0,
        top: 40,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 8,
        width: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 8,
    },
    completeButton: {
        backgroundColor: COLORS.success,
        flex: 0.48,
    },
    completeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});