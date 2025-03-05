import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign, MoreVertical, Check, X, CheckSquare, MessageSquare, Users, AlertTriangle } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";
import Confirmation from "@/components/Confirmation";
import { COLORS } from "@/constant/color";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SkeletonChooseFreelancer from "./SkeletonChooseFreelancer";

interface User {
    _id: string;
    fullName: string;
    profileImage: string;
    location: string;
    rating: number;
    skills: string[];
    balance: number;
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
    project: {
        budget: number;
    };
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
    const { projectId: rawProjectId } = route.params as { projectId: string };
    
    // Pastikan projectId adalah string dan tidak ada whitespace
    const projectId = rawProjectId?.toString().trim();
    
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
    
    // Debug projectId
    useEffect(() => {
    }, [projectId]);
    
    const [actionType, setActionType] = useState<{ id: string | null, type: 'accept' | 'reject' | null }>({ id: null, type: null });

    // Fetch project details - pastikan projectId valid
    const { 
        data: project, 
        isLoading: projectLoading, 
        error: projectError,
        refetch: refetchProject
    } = useFetch<Project>({
        endpoint: `projects/${projectId}`,
        requiresAuth: true,
        enabled: !!projectId && projectId.length === 24,
    });

    // Tambahkan useEffect untuk logging error
    useEffect(() => {
        if (projectError) {
            console.error("Error fetching project:", projectError);
            console.error("Endpoint used:", `projects/${projectId}`);
        }
    }, [projectError, projectId]);

    // Fetch project features (applicants)
    const { 
        data: allFeatures = [], 
        isLoading: featuresLoading, 
        error: featuresError,
        refetch: refetchFeatures
    } = useFetch<ProjectFeature[]>({
        endpoint: 'projectfeatures',
        requiresAuth: true,
    });

    // Tambahkan useEffect untuk logging error
    useEffect(() => {
        if (featuresError) {
            console.error("Error fetching features:", featuresError);
        }
    }, [featuresError]);

    // Fetch freelancer details for each feature
    const { 
        data: users = [], 
        isLoading: usersLoading, 
        error: usersError,
        refetch: refetchUsers
    } = useFetch<User[]>({
        endpoint: 'users',
        requiresAuth: true,
    });

    // Tambahkan useEffect untuk logging error
    useEffect(() => {
        if (usersError) {
            console.error("Error fetching users:", usersError);
        }
    }, [usersError]);

    // Filter features for this project and add freelancer data
    const applicants = allFeatures
        .filter((feature) => {
            const match = feature.projectId === projectId;
            return match;
        })
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

    const updateBalance = useMutation<User, Record<string, unknown>>({
        endpoint: 'users',
        method: 'PATCH',
        requiresAuth: true,
        invalidateQueries: ['users']
    });

    // State untuk menyimpan ID feature yang akan diproses
    const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

    // State untuk dropdown menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // State untuk refresh control
    const [refreshing, setRefreshing] = useState(false);

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refetchProject(),
            refetchFeatures(),
            refetchUsers()
        ]);
        setRefreshing(false);
    }, [refetchProject, refetchFeatures, refetchUsers]);

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
        
        // Cari feature yang akan diupdate
        const feature = applicants.find(app => app._id === featureId);
        
        if (!feature) {
            setConfirmation({
                visible: true,
                title: 'Gagal',
                message: 'Data proyek tidak ditemukan',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
            return;
        }

        // Ambil budget dari proyek
        const projectBudget = feature.project.budget;
        const freelancerId = feature.freelancerId;

        // Buat promise array untuk kedua request
        const promises = [
            // Update status proyek
            markAsCompleted.mutateAsync({ 
                status: 'completed',
                customEndpoint: `projectfeatures/${featureId}`
            }),
            // Update balance freelancer
            updateBalance.mutateAsync({
                balance: projectBudget,
                customEndpoint: `users/${freelancerId}/balance`
            })
        ];

        // Jalankan kedua request secara bersamaan
        Promise.all(promises)
            .then(() => {
                refetchFeatures();
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Berhasil',
                    message: 'Proyek berhasil ditandai sebagai selesai dan pembayaran telah dikirim ke freelancer.',
                    type: 'success',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            })
            .catch((error) => {
                setActionType({ id: null, type: null });
                setConfirmation({
                    visible: true,
                    title: 'Gagal',
                    message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyelesaikan proyek',
                    type: 'error',
                    onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
                });
            });
    };

    const renderApplicant = ({ item }: { item: ProjectFeature }) => {
        if (!item.freelancer) return null;

        const isRejectLoading = actionType.id === item._id && actionType.type === 'reject';
        const isAcceptLoading = actionType.id === item._id && actionType.type === 'accept';
        const isMenuOpen = openMenuId === item._id;
        
        return (
            <View style={styles.applicantCard}>
                <View style={styles.applicantHeader}>
                    <ImageWithSkeleton
                        source={{ uri: item.freelancer.profileImage }}
                        style={styles.applicantAvatar}
                    />
                    <View style={styles.applicantInfo}>
                        <Text style={styles.applicantName}>{item.freelancer.fullName}</Text>
                        <View style={styles.ratingContainer}>
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.ratingText}>{item.freelancer.rating.toFixed(1)}</Text>
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
                                                navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item.freelancer?._id });
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
                                                navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item.freelancer?._id });
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
                        <Text style={styles.detailText}>{item.freelancer.location || 'Lokasi tidak tersedia'}</Text>
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
                        onPress={() => navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item.freelancer?._id })}
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
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ChevronLeft size={24} color={COLORS.black} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Choose Freelancer</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <AlertTriangle size={40} color={COLORS.error} />
                        </View>
                        <Text style={styles.emptyTitle}>Proyek Tidak Ditemukan</Text>
                        <Text style={styles.emptyText}>
                            Maaf, proyek yang kamu cari tidak ditemukan. Proyek mungkin telah dihapus atau tidak dapat diakses.
                        </Text>
                        <TouchableOpacity 
                            style={[styles.postProjectButton, { backgroundColor: COLORS.error }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.postProjectButtonText}>Kembali</Text>
                        </TouchableOpacity>
                    </View>
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                ListHeaderComponent={() => (
                    project ? (
                        <View style={styles.projectInfoContainer}>
                            <View style={styles.projectInfo}>
                                <View style={styles.projectHeader}>
                                    <View style={styles.projectTitleContainer}>
                                        <Text style={styles.projectCategory}>UI/UX Design</Text>
                                    </View>
                                    <View style={styles.budgetContainer}>
                                        <Text style={styles.budgetLabel}>Budget</Text>
                                        <Text style={styles.projectBudget}>
                                            {project.budget.toLocaleString('id-ID', { 
                                                style: 'currency', 
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.projectTitle} numberOfLines={3}>
                                    {project.title}
                                </Text>
                                <View style={styles.applicantsInfo}>
                                    <Users size={16} color={COLORS.darkGray} />
                                    <Text style={styles.applicantsCount}>
                                        {applicants.length} Pelamar
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : null
                )}
                ListEmptyComponent={() => (
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
                )}
            />
        );
    };

    // Render loading state
    if (projectLoading || featuresLoading || usersLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pilih Freelancer</Text>
                    <View style={{ width: 24 }} />
                </View>
                <SkeletonChooseFreelancer />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pilih Freelancer</Text>
                <View style={{ width: 24 }} />
            </View>
            
            {renderContent()}

            <Confirmation
                visible={confirmation.visible}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={confirmation.onConfirm || (() => setConfirmation(prev => ({ ...prev, visible: false })))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
    },
    backButton: {
        padding: 4,
    },
    projectInfoContainer: {
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 16,
    },
    projectInfo: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    projectTitleContainer: {
        flex: 1,
    },
    projectCategory: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
        lineHeight: 24,
        marginBottom: 16,
    },
    budgetContainer: {
        alignItems: 'flex-end',
    },
    budgetLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    projectBudget: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.success,
    },
    applicantsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    applicantsCount: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkGray,
        marginLeft: 8,
    },
    skeletonContainer: {
        padding: 20,
        gap: 16,
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    applicantCard: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        marginVertical: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        flexDirection: "column",
        gap: 12,
        marginBottom: 16,
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        padding: 12,
        borderRadius: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
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
        marginTop: 40,
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
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        flexGrow: 1,
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
    postProjectButton: {
        backgroundColor: COLORS.error,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    postProjectButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});