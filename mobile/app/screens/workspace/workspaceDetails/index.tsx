import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Calendar, Clock, Paperclip, Send, Image as ImageIcon, FileText, Download, MessageSquare, ChevronRight } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "@/hooks/useUser";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import Input from "./Input";

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
    };
    freelancer: {
        id: string;
        name: string;
        avatar: string;
    };
    startDate: string;
    dueDate: string;
    status: "pending" | "in_progress" | "completed";
    budget: string;
    updates: Update[];
}

export default function WorkspaceDetails() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { projectId, freelancerId } = route.params as { projectId: string; freelancerId?: string };
    const { user } = useUser();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [newUpdate, setNewUpdate] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [sendingUpdate, setSendingUpdate] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        // Simulasi fetch data dari API
        setLoading(true);
        setError(null);
        
        try {
            // Simulasi delay network
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Data dummy
            const dummyProject: ProjectDetails = {
                id: projectId,
                title: "E-commerce Mobile App",
                description: "A full-featured e-commerce mobile application with payment integration",
                client: {
                    id: "client123",
                    name: "Tech Store Inc.",
                    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
                },
                freelancer: {
                    id: "freelancer456",
                    name: "John Developer",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
                },
                startDate: "Oct 15, 2023",
                dueDate: "Jan 20, 2024",
                status: "in_progress",
                budget: "$3,500",
                updates: [
                    {
                        id: "update1",
                        user: {
                            id: "freelancer456",
                            name: "John Developer",
                            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
                            role: "freelancer",
                        },
                        content: "I've completed the user authentication module. Here's the prototype for the login and registration screens.",
                        date: "Nov 15, 2023",
                        attachments: [
                            {
                                id: "att1",
                                type: "image",
                                url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
                                name: "login_screen.png",
                                date: "Nov 15, 2023",
                            },
                            {
                                id: "att2",
                                type: "document",
                                url: "#",
                                name: "authentication_flow.pdf",
                                date: "Nov 15, 2023",
                                size: "2.4 MB",
                            },
                        ],
                    },
                    {
                        id: "update2",
                        user: {
                            id: "client123",
                            name: "Tech Store Inc.",
                            avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
                            role: "client",
                        },
                        content: "Looks great! Can you make the login button a bit more prominent?",
                        date: "Nov 16, 2023",
                        attachments: [],
                    },
                    {
                        id: "update3",
                        user: {
                            id: "freelancer456",
                            name: "John Developer",
                            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
                            role: "freelancer",
                        },
                        content: "I've updated the login button design. Also started working on the product catalog module.",
                        date: "Nov 18, 2023",
                        attachments: [
                            {
                                id: "att3",
                                type: "image",
                                url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
                                name: "updated_login.png",
                                date: "Nov 18, 2023",
                            },
                        ],
                    },
                ],
            };
            
            setProject(dummyProject);
            
            // Jika ada freelancerId, bisa digunakan untuk mengambil data spesifik
            if (freelancerId) {
                console.log("Fetching details for project with freelancer:", freelancerId);
                // Implementasi logika untuk mengambil data proyek dengan freelancer tertentu
            }
        } catch (err) {
            setError("Failed to load project details. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const newAttachment: Attachment = {
                id: `temp-img-${Date.now()}`,
                type: 'image',
                url: asset.uri,
                name: asset.fileName || `image-${Date.now()}.jpg`,
                date: new Date().toLocaleDateString(),
            };
            setAttachments([...attachments, newAttachment]);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            
            if (result.canceled === false && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newAttachment: Attachment = {
                    id: `temp-doc-${Date.now()}`,
                    type: 'document',
                    url: asset.uri,
                    name: asset.name || `document-${Date.now()}`,
                    date: new Date().toLocaleDateString(),
                    size: formatFileSize(asset.size || 0),
                };
                setAttachments([...attachments, newAttachment]);
            }
        } catch (err) {
            console.error("Error picking document:", err);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const removeAttachment = (id: string) => {
        setAttachments(attachments.filter(att => att.id !== id));
    };

    const handleSendUpdate = async (content: string, attachments: Attachment[]) => {
        if (!content.trim() && attachments.length === 0) return;
        
        setSendingUpdate(true);
        
        try {
            // Simulasi pengiriman update ke server
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Tambahkan update baru ke daftar updates
            if (project) {
                const newUpdate: Update = {
                    id: `update-${Date.now()}`,
                    user: {
                        id: user?._id || "",
                        name: user?.fullName || "",
                        avatar: user?.profileImage || "",
                        role: user?.role as 'client' | 'freelancer',
                    },
                    content,
                    date: new Date().toLocaleDateString(),
                    attachments,
                };
                
                setProject({
                    ...project,
                    updates: [newUpdate, ...project.updates],
                });
            }
        } catch (err) {
            console.error('Error sending update:', err);
            // Tampilkan pesan error jika diperlukan
        } finally {
            setSendingUpdate(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "#10B981";
            case "in_progress":
                return "#F59E0B";
            case "pending":
                return "#6B7280";
            default:
                return "#6B7280";
        }
    };

    const renderAttachment = (attachment: Attachment, canRemove = false) => (
        <View key={attachment.id} style={styles.attachmentItem}>
            <View style={styles.attachmentContent}>
                {attachment.type === 'image' ? (
                    <ImageIcon size={24} color="#4B5563" />
                ) : (
                    <FileText size={24} color="#4B5563" />
                )}
                <View style={styles.attachmentDetails}>
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <Text style={styles.attachmentMeta}>
                        {attachment.type === 'document' && attachment.size ? `${attachment.size} • ` : ''}
                        {attachment.date}
                    </Text>
                </View>
            </View>
            <View style={styles.attachmentActions}>
                {canRemove ? (
                    <TouchableOpacity onPress={() => removeAttachment(attachment.id)}>
                        <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.downloadButton}>
                        <Download size={20} color="#2563EB" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderUpdate = (update: Update) => {
        const isCurrentUser = user && update.user.id === user._id;
        
        return (
            <View 
                key={update.id} 
                style={[
                    styles.updateContainer, 
                    isCurrentUser && styles.currentUserUpdate
                ]}
            >
                <View style={styles.updateHeader}>
                    <View style={styles.userInfo}>
                        <Image source={{ uri: update.user.avatar }} style={styles.userAvatar} />
                        <View>
                            <Text style={styles.userName}>{update.user.name}</Text>
                            <Text style={styles.updateDate}>{update.date}</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.roleBadge, 
                        update.user.role === 'client' ? styles.clientBadge : styles.freelancerBadge
                    ]}>
                        <Text style={[
                            styles.roleText, 
                            { color: update.user.role === 'client' ? '#D97706' : '#059669' }
                        ]}>
                            {update.user.role === 'client' ? 'Client' : 'Freelancer'}
                        </Text>
                    </View>
                </View>
                
                {update.content && (
                    <Text style={styles.updateContent}>{update.content}</Text>
                )}
                
                {update.attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                        {update.attachments.map(att => renderAttachment(att))}
                    </View>
                )}
            </View>
        );
    };

    const navigateToProjectDetails = () => {
        // Navigate to project details screen
        navigation.navigate("ProjectDetails", { projectId });
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workspace</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workspace</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProjectDetails}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!project) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workspace</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Project not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workspace</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.projectHeader} onPress={navigateToProjectDetails}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    
                    <View style={styles.projectMeta}>
                        <View style={styles.dateContainer}>
                            <Clock size={16} color="#6B7280" />
                            <Text style={styles.dateText}>
                                {project.startDate} - {project.dueDate}
                            </Text>
                        </View>
                        
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}15` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                                {project.status === "in_progress" ? "In Progress" : 
                                 project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsText}>View Project Details</Text>
                        <ChevronRight size={16} color="#2563EB" />
                    </View>
                </TouchableOpacity>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionTitle}>Updates & Collaboration</Text>
                            <View style={styles.updateCount}>
                                <MessageSquare size={12} color="#2563EB" />
                                <Text style={styles.updateCountText}>{project.updates.length}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.updatesContainer}>
                        {project.updates.map(renderUpdate)}
                    </View>
                </View>
            </ScrollView>

            <Input 
                userRole={user?.role as 'client' | 'freelancer'} 
                onSendUpdate={handleSendUpdate}
                sendingUpdate={sendingUpdate}
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
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
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
    projectHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    projectTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    projectMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#6B7280",
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
    viewDetailsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#2563EB",
        marginRight: 4,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginRight: 8,
    },
    updateCount: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    updateCountText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: "500",
        color: "#2563EB",
    },
    updatesContainer: {
        gap: 16,
    },
    updateContainer: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
    },
    currentUserUpdate: {
        backgroundColor: "#EFF6FF",
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
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    userName: {
        fontSize: 14,
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
        backgroundColor: "#FEF3C7",
    },
    freelancerBadge: {
        backgroundColor: "#DCFCE7",
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
    removeText: {
        fontSize: 12,
        color: "#EF4444",
    },
});