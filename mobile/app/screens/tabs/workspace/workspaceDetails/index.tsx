import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 
import { ChevronLeft, Calendar, Clock, MessageSquare, ChevronRight, ImageIcon, FileText, Download } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/useUser";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import Input from "./Input";

// Definisikan tipe untuk data dari API
interface ProjectFeatureResponse {
    _id: string;
    projectId: string;
    freelancerId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    project: {
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
    };
    discussions: Array<{
        _id: string;
        projectFeatureId: string;
        senderId: string;
        title: string;
        description: string;
        images: string[];
        files: string[];
        createdAt: string;
        updatedAt: string;
        sender: {
            _id: string;
            fullName: string;
            email: string;
            role: string;
            profileImage: string;
            location: string;
        };
    }>;
}

interface Attachment {
    id: string;
    type: 'image' | 'document';
    url: string;
    name: string;
    date: string;
    size?: string;
}

interface Update {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        role: 'client' | 'freelancer';
    };
    content: string;
    date: string;
    attachments: Attachment[];
}

interface ProjectDetails {
    id: string;
    title: string;
    description: string;
    client: {
        id: string;
        name: string;
        avatar: string;
        role: 'client' | 'freelancer';
    };
    freelancer: {
        id: string;
        name: string;
        avatar: string;
        role: 'client' | 'freelancer';
    };
    startDate: string;
    dueDate: string;
    status: string;
    budget: string;
    updates: Update[];
    clientId: string;
}

// Definisikan tipe untuk navigasi
type WorkspaceDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'WorkspaceDetails'>;
type WorkspaceDetailsRouteProp = RouteProp<RootStackParamList, 'WorkspaceDetails'>;

export default function WorkspaceDetails() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<WorkspaceDetailsNavigationProp>();
    const route = useRoute<WorkspaceDetailsRouteProp>();
    const { projectId, freelancerId } = route.params;
    const { user } = useUser();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projectFeature, setProjectFeature] = useState<ProjectFeatureResponse | null>(null);
    const [sendingUpdate, setSendingUpdate] = useState(false);

    useEffect(() => {
        fetchProjectFeature();
    }, [projectId, freelancerId]);

    const fetchProjectFeature = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = await SecureStoreUtils.getToken();
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }
            
            // Fetch semua project features
            const response = await fetch(`${baseUrl}/api/projectfeatures`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Gagal mengambil data project features');
            }
            
            // Filter project feature berdasarkan projectId dan freelancerId
            const feature = result.data.find((f: {projectId: string, freelancerId: string}) => 
                f.projectId === projectId && f.freelancerId === freelancerId
            );
            
            if (!feature) {
                throw new Error('Project feature tidak ditemukan untuk project dan freelancer ini');
            }
            
            // Ambil detail project feature dengan discussions
            const featureResponse = await fetch(`${baseUrl}/api/projectfeatures/${feature._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!featureResponse.ok) {
                throw new Error(`Error: ${featureResponse.status}`);
            }
            
            const featureResult = await featureResponse.json();
            
            if (!featureResult.success) {
                throw new Error(featureResult.message || 'Gagal mengambil detail project feature');
            }
            
            setProjectFeature(featureResult.data);
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError(err instanceof Error ? err.message : "Failed to load project details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendUpdate = async (content: string, attachments: Attachment[]) => {
        if (!content.trim() && attachments.length === 0) return;
        
        setSendingUpdate(true);
        
        try {
            const token = await SecureStoreUtils.getToken();
            
            if (!token || !projectFeature || !user) {
                throw new Error('Data tidak lengkap untuk mengirim update');
            }
            
            // Konversi ID ke format yang benar
            const projectFeatureId = projectFeature._id;
            const senderId = user._id;
            
            // Pastikan ID dalam format yang benar (string 24 karakter hex)
            if (!/^[0-9a-fA-F]{24}$/.test(projectFeatureId) || !/^[0-9a-fA-F]{24}$/.test(senderId)) {
                throw new Error('Format ID tidak valid');
            }
            
            // Buat request ke API untuk membuat diskusi baru
            const response = await fetch(`${baseUrl}/api/projectdiscussions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectFeatureId: projectFeatureId,
                    senderId: senderId,
                    description: content,
                    images: attachments.filter(att => att.type === 'image').map(att => att.url),
                    files: attachments.filter(att => att.type === 'document').map(att => att.url)
                })
            });
            
            // Log response untuk debugging
            const responseText = await response.text();
            console.log('Response:', responseText);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${responseText}`);
            }
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`Invalid JSON response: ${responseText}`);
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Gagal mengirim update');
            }
            
            // Refresh data
            Keyboard.dismiss();
            fetchProjectFeature();
        } catch (err) {
            console.error('Error sending update:', err);
            Alert.alert('Error', err instanceof Error ? err.message : 'Gagal mengirim update');
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

    // Fungsi untuk render attachment
    const renderAttachment = (attachment: Attachment) => {
        const isImage = attachment.type === 'image';
        
        return (
            <View key={attachment.id} style={styles.attachmentItem}>
                <View style={styles.attachmentContent}>
                    {isImage ? (
                        <ImageIcon size={24} color="#4B5563" />
                    ) : (
                        <FileText size={24} color="#4B5563" />
                    )}
                    <View style={styles.attachmentDetails}>
                        <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
                        <Text style={styles.attachmentMeta}>
                            {attachment.date} {attachment.size && `• ${attachment.size}`}
                        </Text>
                    </View>
                </View>
                <View style={styles.attachmentActions}>
                    <TouchableOpacity style={styles.downloadButton}>
                        <Download size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render loading state
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // Render error state
    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProjectFeature}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Jika tidak ada data project feature
    if (!projectFeature || !projectFeature.project) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>Data project tidak ditemukan</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProjectFeature}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Render main content
    const { project, discussions } = projectFeature;
    const userRole = user?.role === 'client' ? 'client' : 'freelancer';

    return (
        <View 
            style={[styles.container, { paddingTop: insets.top }]}
            onStartShouldSetResponder={() => {
                Keyboard.dismiss();
                return false;
            }}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workspace</Text>
                <View style={{ width: 24 }} />
            </View>
            
            {/* Project Info */}
            <View style={styles.projectInfo}>
                <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <TouchableOpacity style={styles.viewProjectButton} onPress={navigateToProjectDetails}>
                        <Text style={styles.viewProjectText}>Lihat Project</Text>
                        <ChevronRight size={16} color="#2563EB" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.projectMeta}>
                    <View style={styles.metaItem}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.metaText}>
                            {new Date(project.createdAt).toLocaleDateString()} - {new Date(project.completedDate).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.metaText}>
                            Status: {projectFeature.status}
                        </Text>
                    </View>
                </View>
                
                <Text style={styles.projectDescription}>{project.description}</Text>
            </View>
            
            {/* Updates Section */}
            <View style={styles.updatesSection}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <MessageSquare size={20} color="#111827" />
                        <Text style={styles.sectionTitle}>Updates & Diskusi</Text>
                    </View>
                </View>
                
                <ScrollView 
                    style={styles.updatesList}
                    keyboardShouldPersistTaps="handled"
                >
                    {discussions && discussions.length > 0 ? (
                        discussions.map((discussion) => (
                            <View key={discussion._id} style={styles.updateItem}>
                                <View style={styles.updateHeader}>
                                    <View style={styles.userInfo}>
                                        <Image 
                                            source={{ uri: discussion.sender?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.sender?.fullName || 'User')}` }} 
                                            style={styles.userAvatar} 
                                        />
                                        <View>
                                            <Text style={styles.userName}>{discussion.sender?.fullName || 'Unknown User'}</Text>
                                            <Text style={styles.updateDate}>{new Date(discussion.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.roleBadge, 
                                        discussion.sender?.role === 'client' ? styles.clientBadge : styles.freelancerBadge
                                    ]}>
                                        <Text style={styles.roleText}>
                                            {discussion.sender?.role === 'client' ? 'Client' : 'Freelancer'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <Text style={styles.updateContent}>{discussion.description}</Text>
                                
                                {(discussion.images.length > 0 || discussion.files.length > 0) && (
                                    <View style={styles.attachmentsContainer}>
                                        {discussion.images.map((url, index) => renderAttachment({
                                            id: `img-${discussion._id}-${index}`,
                                            type: 'image',
                                            url,
                                            name: `Image ${index + 1}`,
                                            date: new Date(discussion.createdAt).toLocaleDateString(),
                                        }))}
                                        
                                        {discussion.files.map((url, index) => renderAttachment({
                                            id: `file-${discussion._id}-${index}`,
                                            type: 'document',
                                            url,
                                            name: `File ${index + 1}`,
                                            date: new Date(discussion.createdAt).toLocaleDateString(),
                                        }))}
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Belum ada update atau diskusi</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
            
            {/* Input Section */}
            <Input 
                userRole={userRole} 
                onSendUpdate={handleSendUpdate} 
                sendingUpdate={sendingUpdate} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    projectInfo: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        flex: 1,
    },
    viewProjectButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewProjectText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2563EB",
        marginRight: 4,
    },
    projectMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: "#6B7280",
    },
    projectDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: "#4B5563",
    },
    updatesSection: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    updatesList: {
        flex: 1,
    },
    updateItem: {
        marginBottom: 20,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    updateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    updateDate: {
        fontSize: 12,
        color: "#6B7280",
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    clientBadge: {
        backgroundColor: "#DBEAFE",
    },
    freelancerBadge: {
        backgroundColor: "#E0F2FE",
    },
    roleText: {
        fontSize: 12,
        fontWeight: "500",
    },
    updateContent: {
        fontSize: 14,
        lineHeight: 22,
        color: "#4B5563",
        marginBottom: 12,
    },
    attachmentsContainer: {
        gap: 8,
    },
    attachmentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    attachmentContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    attachmentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    attachmentMeta: {
        fontSize: 12,
        color: "#6B7280",
    },
    attachmentActions: {
        marginLeft: 8,
    },
    downloadButton: {
        padding: 4,
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
        backgroundColor: "#2563EB",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
    clientInputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    clientInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingLeft: 16,
        paddingRight: 8,
    },
    clientInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
    },
    clientSendButton: {
        backgroundColor: "#2563EB",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    addUpdateContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    selectedAttachments: {
        marginBottom: 12,
        gap: 8,
    },
    selectedAttachment: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        padding: 12,
    },
    removeButton: {
        padding: 4,
    },
    inputContainer: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    updateInput: {
        padding: 12,
        fontSize: 14,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    attachButtons: {
        flexDirection: "row",
        gap: 12,
    },
    attachButton: {
        padding: 4,
    },
    sendButton: {
        backgroundColor: "#2563EB",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
});