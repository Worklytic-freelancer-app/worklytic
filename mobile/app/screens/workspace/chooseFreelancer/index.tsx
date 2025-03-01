import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface ProjectResponse {
    _id: string;
    title: string;
    budget: number;
    assignedFreelancer: Array<{
        _id: string;
        fullName: string;
        profileImage: string;
        email: string;
        role: string;
    }>;
}

interface Applicant {
    _id: string;
    fullName: string;
    profileImage: string;
    email: string;
    role: string;
}

export default function ChooseFreelancer() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { projectId } = route.params as { projectId: string };
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [projectTitle, setProjectTitle] = useState("");
    const [projectBudget, setProjectBudget] = useState(0);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = await SecureStoreUtils.getToken();
            const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const project = result.data as ProjectResponse;
                setProjectTitle(project.title);
                setProjectBudget(project.budget);
                setApplicants(project.assignedFreelancer);
            } else {
                throw new Error("Failed to fetch project details");
            }
        } catch (err) {
            setError("Gagal memuat data pelamar. Silakan coba lagi.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderApplicant = ({ item }: { item: Applicant }) => (
        <View style={styles.applicantCard}>
            <TouchableOpacity onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item._id })}>
                <View style={styles.applicantHeader}>
                    <Image source={{ uri: item.profileImage }} style={styles.applicantAvatar} />
                    <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{item.fullName}</Text>
                    <Text style={styles.applicantEmail}>{item.email}</Text>
                </View>
            </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item._id })}
            >
                <Text style={styles.viewButtonText}>Pilih Freelancer</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProjectDetails}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pilih Freelancer</Text>
                <View style={{ width: 24 }} />
            </View>
            
            <View style={styles.projectInfoContainer}>
                <Text style={styles.projectTitle}>{projectTitle}</Text>
                <View style={styles.budgetContainer}>
                    <DollarSign size={18} color="#059669" />
                    <Text style={styles.budgetText}>
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(projectBudget)}
                    </Text>
                </View>
                <Text style={styles.applicantsCount}>{applicants.length} Pelamar</Text>
            </View>

            {applicants.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Belum ada freelancer yang melamar project ini.</Text>
                </View>
            ) : (
                <FlatList
                    data={applicants}
                    renderItem={renderApplicant}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    applicantHeader: {
        flexDirection: "row",
        marginBottom: 12,
    },
    applicantAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    applicantInfo: {
        justifyContent: "center",
    },
    applicantName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    applicantEmail: {
        fontSize: 14,
        color: "#6B7280",
    },
    viewButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
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
});