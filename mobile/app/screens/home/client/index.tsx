import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell, Plus, Star } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

import { useEffect, useState } from "react";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { baseUrl } from "@/constant/baseUrl";
import TopFreelancer from "../TopFreelancer";

type ClientScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Interface untuk freelancer dari API
interface ApiFreelancer {
    _id: string;
    fullName: string;
    profileImage: string;
    skills: string[];
    rating: number;
    role: string;
}

// Interface untuk service dari API
interface ApiService {
    _id: string;
    freelancerId: string;
    title: string;
    description: string;
    price: number;
    deliveryTime: string;
    category: string;
    images: string[];
    rating: number;
    reviews: number;
    includes: string[];
    requirements: string[];
    createdAt: string;
    updatedAt: string;
    freelancerName?: string;
    freelancerImage?: string;
}

interface Service {
    id: string;
    freelancerName: string;
    freelancerImage: string;
    title: string;
    price: string;
    rating: number;
    reviews: number;
    image: string;
}

interface Section {
    id: string;
    type: "search" | "post-project" | "projects" | "freelancers";
    title?: string;
    data?: ApiFreelancer[] | Service[];
}

export default function Client() {
    const navigation = useNavigation<ClientScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [topFreelancers, setTopFreelancers] = useState<ApiFreelancer[]>([]);
    const [freelancersLoading, setFreelancersLoading] = useState(true);
    const [freelancersError, setFreelancersError] = useState<string | null>(null);
    
    // State untuk popular services
    const [popularServices, setPopularServices] = useState<Service[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [servicesError, setServicesError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopFreelancers();
        fetchPopularServices();
    }, []);

    const fetchTopFreelancers = async () => {
        try {
            setFreelancersLoading(true);
            const token = await SecureStoreUtils.getToken();
            
            const response = await fetch(`${baseUrl}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Filter hanya freelancer dan urutkan berdasarkan rating tertinggi
                const topFreelancers = result.data
                    .filter((user: ApiFreelancer) => user.role === 'freelancer')
                    .sort((a: ApiFreelancer, b: ApiFreelancer) => b.rating - a.rating)
                    .slice(0, 10); // Ambil 10 teratas
                
                setTopFreelancers(topFreelancers);
            } else {
                setFreelancersError(result.message || 'Failed to fetch freelancers');
            }
        } catch (err) {
            setFreelancersError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching freelancers:', err);
        } finally {
            setFreelancersLoading(false);
        }
    };

    // Fungsi untuk mengambil popular services dari API
    const fetchPopularServices = async () => {
        try {
            setServicesLoading(true);
            const token = await SecureStoreUtils.getToken();
            
            // Mengambil data services
            const servicesResponse = await fetch(`${baseUrl}/api/services`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const servicesResult = await servicesResponse.json();
            
            if (servicesResult.success && servicesResult.data) {
                // Mengambil data freelancers untuk mendapatkan nama dan gambar profil
                const freelancersResponse = await fetch(`${baseUrl}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const freelancersResult = await freelancersResponse.json();
                const freelancers = freelancersResult.success ? freelancersResult.data : [];
                
                // Menggabungkan data services dengan data freelancer
                const servicesWithFreelancerInfo = servicesResult.data.map((service: ApiService) => {
                    const freelancer = freelancers.find((f: ApiFreelancer) => f._id === service.freelancerId);
                    
                    return {
                        id: service._id,
                        freelancerName: freelancer ? freelancer.fullName : "Unknown Freelancer",
                        freelancerImage: freelancer ? freelancer.profileImage : "https://via.placeholder.com/150",
                        title: service.title,
                        price: `Rp${service.price.toLocaleString('id-ID')}`,
                        rating: service.rating,
                        reviews: service.reviews,
                        image: service.images[0] || "https://via.placeholder.com/400",
                    };
                });
                
                // Mengurutkan services berdasarkan rating dan jumlah reviews
                const sortedServices = servicesWithFreelancerInfo.sort((a: Service, b: Service) => {
                    // Prioritaskan rating terlebih dahulu
                    if (b.rating !== a.rating) {
                        return b.rating - a.rating;
                    }
                    // Jika rating sama, urutkan berdasarkan jumlah reviews
                    return b.reviews - a.reviews;
                });
                
                setPopularServices(sortedServices);
            } else {
                setServicesError(servicesResult.message || 'Failed to fetch services');
            }
        } catch (err) {
            setServicesError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching services:', err);
        } finally {
            setServicesLoading(false);
        }
    };

    // Update sections array dengan data services yang sudah diambil
    const sections: Section[] = [
        {
            id: "search",
            type: "search",
        },
        {
            id: "post-project",
            type: "post-project",
        },
        {
            id: "projects",
            type: "projects",
            title: "Popular Services",
            data: popularServices,
        },
        {
            id: "freelancers",
            type: "freelancers",
            title: "Top Freelancers",
            data: topFreelancers,
        },
    ];

    const renderService = ({ item }: { item: Service }) => (
        <TouchableOpacity 
            style={styles.serviceCard} 
            onPress={() => navigation.navigate("ServiceDetails", { serviceId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.serviceImage} />
            <View style={styles.serviceInfo}>
                <View style={styles.freelancerInfo}>
                    <Image source={{ uri: item.freelancerImage }} style={styles.freelancerThumb} />
                    <Text style={styles.freelancerName}>{item.freelancerName}</Text>
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.servicePrice}>{item.price}</Text>
                <View style={styles.serviceStats}>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>⭐️ {item.rating}</Text>
                    </View>
                    <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSection = ({ item }: { item: Section }) => {
        switch (item.type) {
            case "post-project":
                return (
                    <TouchableOpacity style={styles.postProjectContainer} onPress={() => navigation.navigate("PostProject")}>
                        <View style={styles.postProjectContent}>
                            <View style={styles.postProjectIcon}>
                                <Plus size={24} color="#ffffff" />
                            </View>
                            <View style={styles.postProjectText}>
                                <Text style={styles.postProjectTitle}>Post a New Project</Text>
                                <Text style={styles.postProjectDescription}>Find the perfect freelancer for your project</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );

            case "search":
                return (
                    <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate("Search")}>
                        <Search size={20} color="#6b7280" />
                        <Text style={styles.searchPlaceholder}>Search </Text>
                    </TouchableOpacity>
                );

            case "projects":
                return (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{item.title}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Services")}>
                                <Text style={styles.seeAllButton}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {servicesLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#0891b2" />
                                <Text style={styles.loadingText}>Loading services...</Text>
                            </View>
                        ) : servicesError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{servicesError}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={fetchPopularServices}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList<Service> 
                                data={item.data as Service[]} 
                                renderItem={renderService} 
                                keyExtractor={(item) => item.id.toString()} 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                contentContainerStyle={styles.servicesScroll} 
                            />
                        )}
                    </View>
                );

            case "freelancers":
                return (
                    <TopFreelancer
                        freelancers={topFreelancers}
                        loading={freelancersLoading}
                        error={freelancersError}
                        onRetry={fetchTopFreelancers}
                        title={item.title || "Top Freelancers"}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Worklytic</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <Bell size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            <FlatList<Section> 
                data={sections} 
                renderItem={renderSection} 
                keyExtractor={(item) => item.id} 
                showsVerticalScrollIndicator={false} 
                style={styles.content} 
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    searchPlaceholder: {
        marginLeft: 8,
        fontSize: 16,
        color: "#6b7280",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
    },
    seeAllButton: {
        fontSize: 14,
        color: "#0891b2",
    },
    servicesScroll: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    serviceCard: {
        width: 280,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
    },
    serviceImage: {
        width: "100%",
        height: 160,
        resizeMode: "cover",
    },
    serviceInfo: {
        padding: 16,
    },
    freelancerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    freelancerThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    freelancerName: {
        fontSize: 14,
        color: "#4b5563",
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0891b2",
        marginBottom: 8,
    },
    serviceStats: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rating: {
        fontSize: 14,
        color: "#4b5563",
        marginRight: 4,
    },
    reviewsText: {
        fontSize: 14,
        color: "#6b7280",
    },
    postProjectContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: "#f0f9ff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e0f2fe",
    },
    postProjectContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    postProjectIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#0891b2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    postProjectText: {
        flex: 1,
    },
    postProjectTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    postProjectDescription: {
        fontSize: 14,
        color: "#4b5563",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: "#6b7280",
    },
    errorContainer: {
        padding: 20,
        alignItems: "center",
    },
    errorText: {
        fontSize: 14,
        color: "#ef4444",
        marginBottom: 8,
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#0891b2",
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        color: "#ffffff",
        fontWeight: "bold",
    },
});
