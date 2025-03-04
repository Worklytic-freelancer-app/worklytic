import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { Pencil, Trash2, Star } from "lucide-react-native";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    deliveryTime?: string;
    category?: string;
    rating?: number;
    reviews?: number;
    includes?: string[];
    requirements?: string[];
    freelancerId?: string;
}

export default function Services() {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    // Menggunakan useUser untuk mendapatkan data user yang sedang login
    const { 
        data: userData, 
        isLoading: isUserLoading, 
        error: userError,
        refetch: refetchUser
    } = useUser();
    
    // Ekstrak services dari data user
    const services = userData?.services || [];
    
    // Menggunakan useMutation untuk menghapus layanan
    const { mutate: deleteService } = useMutation<
        { success: boolean; message: string }, 
        { customEndpoint: string }
    >({
        endpoint: 'services',
        method: 'DELETE',
        invalidateQueries: ['user'],
        onSuccess: () => {
            Alert.alert("Sukses", "Layanan berhasil dihapus");
        },
    });

    const handleDeleteService = async (serviceId: string) => {
        try {
            setDeletingId(serviceId);
            deleteService({ customEndpoint: `services/${serviceId}` });
        } catch (err) {
            Alert.alert("Error", "Terjadi kesalahan saat menghapus layanan");
        } finally {
            setDeletingId(null);
        }
    };

    const confirmDelete = (serviceId: string) => {
        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus layanan ini?",
            [
                { text: "Batal", style: "cancel" },
                { text: "Hapus", style: "destructive", onPress: () => handleDeleteService(serviceId) }
            ]
        );
    };

    // Format harga ke format Rupiah
    const formatPrice = (price: number) => {
        return `Rp${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    };

    if (isUserLoading) {
        return (
            <View style={[styles.section, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (userError) {
        return (
            <View style={[styles.section, styles.errorContainer]}>
                <Text style={styles.errorText}>Gagal memuat layanan: {userError.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetchUser()}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Layanan Saya</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("AddService")}
                    style={styles.addButton}
                >
                    <Plus size={20} color={COLORS.background} />
                    <Text style={styles.addButtonText}>Add Service</Text>
                </TouchableOpacity>
            </View>

            {services.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Anda belum memiliki layanan</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("AddService")}
                        style={[styles.addButton, { marginTop: 12 }]}
                    >
                        <Plus size={20} color={COLORS.background} />
                        <Text style={styles.addButtonText}>Tambah Layanan</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.servicesContainer}
                >
                    {services.map((service: Service) => (
                        <View key={service._id} style={styles.serviceCard}>
                            <Image 
                                source={{ uri: service.images[0] }} 
                                style={styles.serviceImage}
                            />
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle} numberOfLines={2}>
                                    {service.title}
                                </Text>
                                <Text style={styles.serviceDescription} numberOfLines={2}>
                                    {service.description}
                                </Text>
                                <Text style={styles.servicePrice}>
                                    Rp {service.price.toLocaleString('id-ID')}
                                </Text>
                                <View style={styles.serviceStats}>
                                    <View style={styles.ratingContainer}>
                                        <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                                        <Text style={styles.ratingText}>
                                            {service.rating} ({service.reviews})
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate("EditService", { serviceId: service._id })}
                                        style={[styles.actionButton, styles.editButton]}
                                    >
                                        <Pencil size={16} color={COLORS.background} />
                                        <Text style={styles.actionButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => confirmDelete(service._id)}
                                        style={[styles.actionButton, styles.deleteButton]}
                                        disabled={deletingId === service._id}
                                    >
                                        {deletingId === service._id ? (
                                            <ActivityIndicator size="small" color={COLORS.background} />
                                        ) : (
                                            <>
                                                <Trash2 size={16} color={COLORS.background} />
                                                <Text style={styles.actionButtonText}>Delete</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: '500',
    },
    servicesContainer: {
        paddingHorizontal: 16,
        gap: 16,
    },
    serviceCard: {
        width: 280,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    serviceImage: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
    },
    serviceContent: {
        padding: 16,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
    },
    serviceDescription: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 8,
        lineHeight: 20,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 8,
    },
    serviceStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: COLORS.gray,
        marginLeft: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionButtonText: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: COLORS.primary,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: COLORS.error,
        marginBottom: 12,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.background,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.primary}05`,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${COLORS.primary}10`,
        marginHorizontal: 20,
    },
    emptyText: {
        color: COLORS.gray,
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 20,
    },
});