import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Star, Calendar, MapPin, DollarSign } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface Applicant {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    location: string;
    appliedDate: string;
    coverLetter: string;
}

export default function ChooseFreelancer() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { projectId } = route.params as { projectId: string };
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [projectTitle, setProjectTitle] = useState("Project");
    const [projectBudget, setProjectBudget] = useState(3500);

    useEffect(() => {
        fetchApplicants();
    }, [projectId]);

    const fetchApplicants = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Simulasi fetch data dari API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Data dummy untuk demo
            setProjectTitle("E-commerce Website Development");
            setProjectBudget(3500);
            setApplicants([
                {
                    id: "1",
                    name: "John Developer",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
                    rating: 4.8,
                    location: "Jakarta, Indonesia",
                    appliedDate: "3 days ago",
                    coverLetter: "I have 5 years of experience in e-commerce development with React and Node.js.",
                },
                {
                    id: "2",
                    name: "Sarah Designer",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60",
                    rating: 4.9,
                    location: "Bandung, Indonesia",
                    appliedDate: "5 days ago",
                    coverLetter: "I specialize in UI/UX design for e-commerce platforms with a focus on conversion optimization.",
                },
                {
                    id: "3",
                    name: "Michael Coder",
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60",
                    rating: 4.7,
                    location: "Surabaya, Indonesia",
                    appliedDate: "1 week ago",
                    coverLetter: "Full stack developer with experience in e-commerce solutions and payment gateway integration.",
                },
            ]);
        } catch (err) {
            setError("Failed to load applicants. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderApplicant = ({ item }: { item: Applicant }) => (
        <TouchableOpacity 
            style={styles.applicantCard} 
            onPress={() => navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item.id })}
        >
            <View style={styles.applicantHeader}>
                <Image source={{ uri: item.avatar }} style={styles.applicantAvatar} />
                <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{item.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.applicantDetails}>
                <View style={styles.detailItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Applied {item.appliedDate}</Text>
                </View>
            </View>
            
            <Text style={styles.coverLetter}>{item.coverLetter}</Text>
            
            <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => navigation.navigate("WorkspaceDetails", { projectId, freelancerId: item.id })}
            >
                <Text style={styles.viewButtonText}>Pilih Freelancer</Text>
            </TouchableOpacity>
        </TouchableOpacity>
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
                <TouchableOpacity style={styles.retryButton} onPress={fetchApplicants}>
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
                    <Text style={styles.budgetText}>{projectBudget}</Text>
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
                    keyExtractor={(item) => item.id}
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
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#4B5563",
    },
    applicantDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#6B7280",
    },
    coverLetter: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 16,
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