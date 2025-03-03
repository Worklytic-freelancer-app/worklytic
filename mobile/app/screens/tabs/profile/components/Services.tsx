import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { Pencil, Trash2 } from "lucide-react-native";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";

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
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Layanan Saya</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddService")}>
                    <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
            
            {services.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Anda belum memiliki layanan</Text>
                    <TouchableOpacity 
                        style={styles.addServiceButton} 
                        onPress={() => navigation.navigate("AddService")}
                    >
                        <Text style={styles.addServiceButtonText}>Tambah Layanan</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.servicesContainer}
                >
                    {services.map((service: Service) => (
                        <TouchableOpacity 
                            key={service._id} 
                            style={styles.serviceCard}
                        >
                            <Image 
                                source={{ uri: service.images[0] }} 
                                style={styles.serviceImage}
                            />
                            <Text style={styles.serviceTitle}>{service.title}</Text>
                            <Text style={styles.serviceDescription}>{service.description}</Text>
                            <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                            
                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        navigation.navigate("EditService", { serviceId: service._id });
                                    }}
                                >
                                    <Pencil size={16} color="#ffffff" />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(service._id);
                                    }}
                                    disabled={deletingId === service._id}
                                >
                                    {deletingId === service._id ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <>
                                            <Trash2 size={16} color="#ffffff" />
                                            <Text style={styles.actionButtonText}>Hapus</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: 280,
    marginLeft: 12,
  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginHorizontal: 12,
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  addServiceButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addServiceButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});