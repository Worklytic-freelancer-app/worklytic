import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Calendar, MapPin, Tag, DollarSign } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { COLORS } from "@/constant/color";
import { useState } from "react";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { usePayment } from '@/hooks/tanstack/usePayment';

type ReviewPostProjectRouteProp = RouteProp<RootStackParamList, 'ReviewPostProject'>;
type ReviewPostProjectNavigationProp = StackNavigationProp<RootStackParamList>;

// Definisikan interface untuk response data
interface ProjectResponse {
    _id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: Date;
    status: string;
    requirements: string[];
    image: string[];
    clientId: string;
}

// Definisikan interface untuk request data
interface CreateProjectRequest {
    clientId: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: Date;
    status: string;
    requirements: string[];
    image: string[];
}

export default function ReviewPostProject() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<ReviewPostProjectNavigationProp>();
    const route = useRoute<ReviewPostProjectRouteProp>();
    const projectData = route.params;
    const [loading, setLoading] = useState(false);

    // Gunakan hook useMutation dengan tipe data yang spesifik
    const createProjectMutation = useMutation<ProjectResponse, CreateProjectRequest>({
        endpoint: 'projects',
        method: 'POST',
        requiresAuth: true,
    });

    // Gunakan hook usePayment
    const { createPayment } = usePayment();

    // Fungsi untuk memvalidasi proyek sebelum dibuat
    const validateProject = () => {
        // Validasi dasar
        if (!projectData.title.trim()) {
            Alert.alert('Error', 'Judul proyek tidak boleh kosong');
            return false;
        }
        
        if (!projectData.description.trim()) {
            Alert.alert('Error', 'Deskripsi proyek tidak boleh kosong');
            return false;
        }
        
        if (projectData.budget <= 0) {
            Alert.alert('Error', 'Budget harus lebih dari 0');
            return false;
        }
        
        // Validasi tambahan sesuai kebutuhan
        
        return true;
    };

    const handleCreateProject = async () => {
        try {
            // Validasi proyek terlebih dahulu
            if (!validateProject()) {
                return;
            }
            
            setLoading(true);
            
            // Siapkan requirements sebagai array
            const requirementsArray = projectData.requirements
                ? projectData.requirements.split('\n').filter((item: string) => item.trim() !== '')
                : [];
            
            // Buat project menggunakan mutation
            const result = await createProjectMutation.mutateAsync({
                clientId: projectData.clientId,
                title: projectData.title,
                description: projectData.description,
                budget: projectData.budget,
                category: projectData.category,
                location: projectData.location,
                completedDate: new Date(projectData.completedDate),
                status: projectData.status,
                requirements: requirementsArray,
                image: projectData.images
            });
            
            if (result?._id) {
                // Navigasi ke halaman pembayaran dengan ID proyek
                navigation.navigate('Payment', { projectId: result._id });
                
                // Inisiasi pembayaran di background (opsional)
                // Ini akan mempersiapkan data pembayaran sebelum halaman Payment dimuat
                if (projectData.clientId) {
                    createPayment(
                        {
                            userId: projectData.clientId,
                            projectId: result._id
                        },
                        {
                            onSuccess: (data) => {
                                console.log('Payment initiated successfully:', data.orderId);
                            },
                            onError: (err) => {
                                console.error('Failed to initiate payment:', err);
                                // Tidak perlu menampilkan alert karena halaman Payment akan menanganinya
                            }
                        }
                    );
                }
            } else {
                throw new Error('Failed to create project');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Format tanggal
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    // Format budget
    const formatBudget = (budget: number) => {
        return `Rp${budget.toLocaleString('id-ID')}`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Proyek</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {projectData.images && projectData.images.length > 0 && (
                    <ScrollView 
                        horizontal 
                        style={styles.imageContainer} 
                        showsHorizontalScrollIndicator={false}
                    >
                        {projectData.images.map((uri: string, index: number) => (
                            <Image key={index} source={{ uri }} style={styles.projectImage} />
                        ))}
                    </ScrollView>
                )}

                <View style={styles.card}>
                    <Text style={styles.projectTitle}>{projectData.title}</Text>
                    
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <Tag size={16} color={COLORS.primary} />
                            </View>
                            <Text style={styles.detailText}>{projectData.category}</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <MapPin size={16} color={COLORS.primary} />
                            </View>
                            <Text style={styles.detailText}>{projectData.location}</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <Calendar size={16} color={COLORS.primary} />
                            </View>
                            <Text style={styles.detailText}>
                                Deadline: {formatDate(projectData.completedDate)}
                            </Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <DollarSign size={16} color={COLORS.primary} />
                            </View>
                            <Text style={styles.detailText}>
                                Budget: {formatBudget(projectData.budget)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Deskripsi Proyek</Text>
                    <Text style={styles.description}>{projectData.description}</Text>
                </View>

                {projectData.requirements && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Persyaratan</Text>
                        <Text style={styles.description}>{projectData.requirements}</Text>
                    </View>
                )}
                
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        Setelah mengkonfirmasi proyek, Anda akan diarahkan ke halaman pembayaran untuk menyelesaikan proses pembuatan proyek.
                    </Text>
                </View>
                
                {/* Tambahkan padding bottom untuk memberikan ruang saat scroll */}
                <View style={{ height: 20 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
                <TouchableOpacity 
                    style={[styles.confirmButton, loading && styles.disabledButton]}
                    onPress={handleCreateProject}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.background} size="small" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Konfirmasi & Lanjutkan</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    imageContainer: {
        marginBottom: 16,
    },
    projectImage: {
        width: 280,
        height: 160,
        borderRadius: 12,
        marginRight: 12,
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.black,
        marginBottom: 16,
    },
    detailsContainer: {
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailText: {
        fontSize: 15,
        color: COLORS.darkGray,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: COLORS.darkGray,
        lineHeight: 24,
    },
    infoCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    infoText: {
        fontSize: 14,
        color: COLORS.primary,
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: COLORS.primaryLight,
        opacity: 0.7,
    },
    confirmButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: "600",
    },
});