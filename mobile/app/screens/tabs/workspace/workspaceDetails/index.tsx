import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Keyboard, RefreshControl, KeyboardAvoidingView, Platform, EmitterSubscription, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 
import { ChevronLeft, Calendar, Clock, MessageSquare, ChevronRight, ImageIcon, FileText, Download } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/tanstack/useUser";
import Input, { Attachment } from "./Input";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { COLORS } from "@/constant/color";
import Confirmation from "@/components/Confirmation";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { getMimeTypeFromFilename } from "@/utils/fileHelper";
import SkeletonWorkspaceDetails from './SkeletonWorkspaceDetails';

// Definisikan tipe untuk data dari API
interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage: string;
    location: string;
}

interface Discussion {
    _id: string;
    projectFeatureId: string;
    senderId: string;
    title: string;
    description: string;
    images: string[];
    files: string[];
    createdAt: string;
    updatedAt: string;
    sender: User;
}

interface Project {
    _id: string;
    clientId: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: string;
    status: string;
    requirements: string[];
    image: string[];
    createdAt: string;
    updatedAt: string;
}

interface ProjectFeature {
    _id: string;
    projectId: string;
    freelancerId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectFeatureResponse extends ProjectFeature {
    project: Project;
    discussions: Discussion[];
}

// Tipe untuk request diskusi baru
interface NewDiscussionRequest {
    projectFeatureId: string;
    senderId: string;
    description: string;
    images: string[];
    files: string[];
}

// Definisikan tipe untuk navigasi
type WorkspaceDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'WorkspaceDetails'>;
type WorkspaceDetailsRouteProp = RouteProp<RootStackParamList, 'WorkspaceDetails'>;

export default function WorkspaceDetails() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<WorkspaceDetailsNavigationProp>();
    const route = useRoute<WorkspaceDetailsRouteProp>();
    const { projectId, freelancerId } = route.params;
    
    // Gunakan useUser hook untuk mendapatkan data user
    const { data: user, isLoading: userLoading } = useUser();
    
    const [featureId, setFeatureId] = useState<string | null>(null);
    const [sendingUpdate, setSendingUpdate] = useState(false);
    
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
        type: 'success',
    });

    // Fetch semua project features untuk menemukan yang sesuai
    const { 
        data: allFeatures = [], 
        isLoading: featuresLoading,
        refetch: refetchAllFeatures
    } = useFetch<ProjectFeature[]>({
        endpoint: 'projectfeatures',
        requiresAuth: true,
        enabled: !!projectId && !!freelancerId
    });

    // Cari feature ID yang sesuai dengan projectId dan freelancerId
    useEffect(() => {
        if (allFeatures.length > 0 && !featureId) {
            const feature = allFeatures.find(f => 
                f.projectId === projectId && f.freelancerId === freelancerId
            );
            
            if (feature) {
                setFeatureId(feature._id);
            }
        }
    }, [allFeatures, projectId, freelancerId]);

    // Fetch detail project feature dengan discussions
    const {
        data: projectFeature,
        isLoading: detailLoading,
        error: detailError,
        refetch: refetchProjectFeature
    } = useFetch<ProjectFeatureResponse>({
        endpoint: `projectfeatures/${featureId}`,
        requiresAuth: true,
        enabled: !!featureId
    });

    // Mutation untuk mengirim diskusi baru
    const sendDiscussion = useMutation<Discussion, Record<string, unknown>>({
        endpoint: 'projectdiscussions',
        method: 'POST',
        requiresAuth: true,
        onSuccess: () => {
            // Refresh data setelah berhasil mengirim diskusi
            refetchProjectFeature();
        },
        invalidateQueries: [`projectfeatures/${featureId}`]
    });

    // State untuk tracking proses download
    const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
    
    // Request permission untuk menyimpan file
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    
    // Fungsi untuk mendownload file
    const handleDownload = async (url: string, filename: string) => {
        try {
            // Tandai file sedang didownload
            setDownloadingFiles(prev => ({ ...prev, [url]: true }));
            
            // Request permission jika belum
            if (!mediaPermission?.granted) {
                const { granted } = await requestMediaPermission();
                if (!granted) {
                    Alert.alert("Izin Diperlukan", "Aplikasi membutuhkan izin untuk menyimpan file");
                    setDownloadingFiles(prev => ({ ...prev, [url]: false }));
                    return;
                }
            }
            
            // Tentukan lokasi penyimpanan di cache
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;
            
            // Download file
            const downloadResult = await FileSystem.downloadAsync(url, fileUri);
            
            if (downloadResult.status === 200) {
                // Cek apakah file adalah gambar
                const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                
                if (isImage) {
                    // Simpan gambar ke galeri
                    const asset = await MediaLibrary.saveToLibraryAsync(fileUri);
                    Alert.alert("Berhasil", "Gambar telah disimpan ke galeri");
                } else {
                    // Share file lainnya
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(fileUri, {
                            mimeType: getMimeTypeFromFilename(filename),
                            dialogTitle: `Bagikan ${filename}`,
                            UTI: 'public.item'
                        });
                    } else {
                        Alert.alert("Error", "Sharing tidak tersedia di perangkat ini");
                    }
                }
            } else {
                Alert.alert("Error", "Gagal mengunduh file");
            }
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Terjadi kesalahan saat mengunduh file");
        } finally {
            // Hapus status downloading
            setDownloadingFiles(prev => ({ ...prev, [url]: false }));
        }
    };
    
    // Fungsi untuk mendapatkan nama file dari URL
    const getFilenameFromUrl = (url: string): string => {
        // Ekstrak nama file dari URL
        const urlParts = url.split('/');
        let filename = urlParts[urlParts.length - 1];
        
        // Hapus parameter query jika ada
        if (filename.includes('?')) {
            filename = filename.split('?')[0];
        }
        
        // Decode URI components
        try {
            filename = decodeURIComponent(filename);
        } catch (e) {
            // Jika gagal decode, gunakan filename asli
        }
        
        return filename || `file-${Date.now()}`;
    };

    const handleSendUpdate = async (content: string, attachments: Attachment[]) => {
        if (!content.trim() && attachments.length === 0) return;
        if (!featureId || !user?._id) {
            setConfirmation({
                visible: true,
                title: 'Error',
                message: 'Data tidak lengkap untuk mengirim update',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
            return;
        }
        
        setSendingUpdate(true);
        
        try {
            // Kirim diskusi baru menggunakan mutation
            await sendDiscussion.mutateAsync({
                projectFeatureId: featureId,
                senderId: user._id,
                description: content,
                images: attachments.filter(att => att.type === 'image').map(att => att.url),
                files: attachments.filter(att => att.type === 'document').map(att => att.url)
            });
            
            // Tampilkan konfirmasi sukses
            setConfirmation({
                visible: true,
                title: 'Berhasil',
                message: 'Update berhasil dikirim',
                type: 'success',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
        } catch (err) {
            console.error('Error sending update:', err);
            setConfirmation({
                visible: true,
                title: 'Error',
                message: err instanceof Error ? err.message : 'Gagal mengirim update',
                type: 'error',
                onConfirm: () => setConfirmation(prev => ({ ...prev, visible: false })),
            });
        } finally {
            setSendingUpdate(false);
        }
    };

    const navigateToProjectDetails = () => {
        if (projectFeature?.project) {
            navigation.navigate('ProjectDetails', { 
                projectId: projectFeature.project._id, 
                clientId: projectFeature.project.clientId 
            });
        }
    };

    const refreshData = () => {
        refetchAllFeatures();
        if (featureId) {
            refetchProjectFeature();
        }
    };

    // Format tanggal untuk tampilan yang lebih baik
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Format jam
            return `Today at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            // Format tanggal lengkap
            const options: Intl.DateTimeFormatOptions = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            };
            return date.toLocaleDateString('id-ID', options);
        }
    };

    // Render attachment dalam diskusi
    const renderAttachment = (url: string, type: 'image' | 'file') => {
        const filename = getFilenameFromUrl(url);
        const isDownloading = downloadingFiles[url] || false;
        
        return (
            <View key={url} style={styles.attachmentItem}>
                <View style={styles.attachmentContent}>
                    {type === 'image' ? (
                        <View style={styles.attachmentIconContainer}>
                            <ImageIcon size={20} color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={styles.attachmentIconContainer}>
                            <FileText size={20} color={COLORS.primary} />
                        </View>
                    )}
                    <View style={styles.attachmentDetails}>
                        <Text style={styles.attachmentName} numberOfLines={1}>{filename}</Text>
                        <Text style={styles.attachmentMeta}>
                            {type === 'image' ? 'Gambar' : 'Dokumen'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.downloadButton} 
                    onPress={() => handleDownload(url, filename)}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Download size={20} color={COLORS.primary} />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // Tambahkan userLoading ke kondisi loading
    const isLoading = featuresLoading || (!!featureId && detailLoading) || userLoading;
    const error = detailError;

    const renderHeader = () => {
        if (!projectFeature?.project) return null;
        
        return (
            <View style={styles.projectInfoContainer}>
                <TouchableOpacity 
                    style={styles.projectInfo}
                    onPress={navigateToProjectDetails}
                >
                    <View style={styles.projectTitleContainer}>
                        <Text style={styles.projectTitle} numberOfLines={2}>
                            {projectFeature.project.title}
                        </Text>
                        <Text style={styles.projectBudget}>
                            Rp{projectFeature.project.budget.toLocaleString('id-ID')}
                        </Text>
                    </View>
                    <View style={styles.projectMeta}>
                        <View style={styles.metaItem}>
                            <Calendar size={16} color={COLORS.gray} />
                            <Text style={styles.metaText}>
                                {formatDate(projectFeature.project.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {projectFeature.status}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    // Tambahkan useMemo untuk menghitung padding bottom
    const paddingBottom = useMemo(() => {
        const inputHeight = 140; // Perkiraan tinggi input + padding
        const bottomInset = insets.bottom;
        return inputHeight + bottomInset;
    }, [insets.bottom]);

    if (isLoading && !projectFeature) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workspace</Text>
                    <View style={{ width: 24 }} />
                </View>
                <SkeletonWorkspaceDetails />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{(error as Error).message || "Terjadi kesalahan"}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workspace Details</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* FlatList dengan ListHeaderComponent */}
            <FlatList
                data={projectFeature?.discussions || []}
                ListHeaderComponent={renderHeader}
                renderItem={({ item: discussion }) => (
                    <View style={styles.updateItem}>
                        <View style={styles.updateHeader}>
                            <View style={styles.userInfo}>
                                <Image 
                                    source={{ 
                                        uri: discussion.sender.profileImage || 
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.sender.fullName)}&background=random` 
                                    }} 
                                    style={styles.userAvatar} 
                                />
                                <View>
                                    <Text style={styles.userName}>{discussion.sender.fullName}</Text>
                                    <View style={[
                                        styles.roleBadge, 
                                        discussion.sender.role === 'client' ? styles.clientBadge : styles.freelancerBadge
                                    ]}>
                                        <Text style={[
                                            styles.roleText,
                                            { 
                                                color: discussion.sender.role === 'client' 
                                                    ? COLORS.primary 
                                                    : '#0284c7'
                                            }
                                        ]}>
                                            {discussion.sender.role === 'client' ? 'Client' : 'Freelancer'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.updateDate}>{formatDate(discussion.createdAt)}</Text>
                        </View>
                        
                        {discussion.description && (
                            <Text style={styles.updateContent}>{discussion.description}</Text>
                        )}
                        
                        {(discussion.images.length > 0 || discussion.files.length > 0) && (
                            <View style={styles.attachmentsContainer}>
                                {discussion.images.map(url => renderAttachment(url, 'image'))}
                                {discussion.files.map(url => renderAttachment(url, 'file'))}
                            </View>
                        )}
                    </View>
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={[
                    styles.discussionsContent,
                    { paddingBottom: paddingBottom }
                ]}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Belum ada diskusi untuk proyek ini. Mulai diskusi dengan mengirim pesan.
                        </Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl 
                        refreshing={isLoading} 
                        onRefresh={refreshData}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        progressBackgroundColor={COLORS.background}
                    />
                }
            />

            {/* Input dengan KeyboardAvoidingView */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={[
                    styles.inputContainer, 
                    { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }
                ]}>
                    <Input 
                        onSend={handleSendUpdate} 
                        loading={sendingUpdate} 
                    />
                </View>
            </KeyboardAvoidingView>
            
            {/* Konfirmasi */}
            <Confirmation
                visible={confirmation.visible}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.black,
    },
    projectInfoContainer: {
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginTop: 4,
        paddingBottom: 16,
        marginBottom: 16,
    },
    projectInfo: {
        backgroundColor: COLORS.background,
        marginTop: 16,
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
    projectTitleContainer: {
        marginBottom: 16,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
        marginBottom: 8,
    },
    projectBudget: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.success,
    },
    projectMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    metaText: {
        fontSize: 13,
        color: COLORS.gray,
        fontWeight: "500",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.primary,
    },
    discussionsContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 0,
    },
    updateItem: {
        marginBottom: 16,
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    updateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(8, 145, 178, 0.1)',
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 4,
    },
    updateDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        maxWidth: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientBadge: {
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
    },
    freelancerBadge: {
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
    },
    roleText: {
        fontSize: 11,
        fontWeight: "500",
    },
    updateContent: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.darkGray,
        marginBottom: 16,
    },
    attachmentsContainer: {
        gap: 8,
    },
    attachmentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    attachmentContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    attachmentIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.black,
    },
    attachmentMeta: {
        fontSize: 12,
        color: COLORS.gray,
    },
    downloadButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
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
        color: COLORS.error,
        marginBottom: 16,
        textAlign: "center",
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
        fontSize: 15,
        fontWeight: "600",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: "center",
        lineHeight: 24,
    },
    keyboardAvoidingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: COLORS.background,
        width: '100%',
    },
});