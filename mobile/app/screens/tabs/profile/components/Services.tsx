import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { Pencil, Trash2, Star, MoreVertical } from "lucide-react-native";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import Confirmation from "@/components/Confirmation";
import { Menu, MenuItem } from '@/components/Menu';

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
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [showActionConfirmation, setShowActionConfirmation] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    
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
            Alert.alert("Success", "Service deleted successfully");
        },
    });

    const handleDeleteService = async (serviceId: string) => {
        try {
            setDeletingId(serviceId);
            deleteService({ customEndpoint: `services/${serviceId}` });
            setShowConfirmation(false);
        } catch (err) {
            setShowConfirmation(false);
        } finally {
            setDeletingId(null);
            setServiceToDelete(null);
        }
    };

    const confirmDelete = (serviceId: string) => {
        setServiceToDelete(serviceId);
        setShowConfirmation(true);
    };

    // Format harga ke format Rupiah
    const formatPrice = (price: number) => {
        return `Rp${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    };

    const showActionMenu = (serviceId: string, event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setSelectedService(serviceId);
        setMenuPosition({ x: pageX, y: pageY });
        setMenuVisible(true);
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
                <Text style={styles.errorText}>Failed to load services: {userError.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetchUser()}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Services</Text>
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
                    <Text style={styles.emptyText}>You don't have any services yet</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("AddService")}
                        style={[styles.addButton, { marginTop: 12 }]}
                    >
                        <Plus size={20} color={COLORS.background} />
                        <Text style={styles.addButtonText}>Add Service</Text>
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
                            <ImageWithSkeleton 
                                source={{ uri: service.images[0] }} 
                                style={styles.serviceImage}
                                skeletonStyle={{ borderRadius: 0 }}
                            />
                            <TouchableOpacity 
                                style={styles.moreButton}
                                onPress={(event) => showActionMenu(service._id, event)}
                            >
                                <MoreVertical size={20} color={COLORS.black} />
                            </TouchableOpacity>
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
                                            {service.rating || 0} ({service.reviews || 0})
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                position={menuPosition}
            >
                <MenuItem
                    icon="edit"
                    onPress={() => {
                        setMenuVisible(false);
                        selectedService && navigation.navigate("EditService", { serviceId: selectedService });
                    }}
                >
                    Edit Service
                </MenuItem>
                <MenuItem
                    icon="trash"
                    onPress={() => {
                        setMenuVisible(false);
                        selectedService && confirmDelete(selectedService);
                    }}
                    destructive
                >
                    Delete Service
                </MenuItem>
            </Menu>

            <Confirmation
                visible={showConfirmation}
                title="Delete Service"
                message="Are you sure you want to delete this service?"
                type="warning"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => serviceToDelete && handleDeleteService(serviceToDelete)}
                onCancel={() => {
                    setShowConfirmation(false);
                    setServiceToDelete(null);
                }}
                loading={!!deletingId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingLeft: 0,
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
        gap: 12,
        paddingHorizontal: 20,
    },
    serviceCard: {
        width: 280,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 16,
    },
    serviceImage: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
    },
    moreButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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