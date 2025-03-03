import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Plus, Star } from "lucide-react-native";
import Header from "@/components/Header";
import { COLORS } from "@/constant/color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

import { useEffect, useState } from "react";
import TopFreelancer from "../TopFreelancer";
import { useFetch } from "@/hooks/tanstack/useFetch";

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

  // Menggunakan useFetch untuk mendapatkan data freelancer
  const {
    data: freelancersData = [],
    isLoading: freelancersLoading,
    error: freelancersError,
    refetch: refetchFreelancers,
  } = useFetch<ApiFreelancer[]>({
    endpoint: "users",
  });

  // Menggunakan useFetch untuk mendapatkan data services
  const {
    data: servicesData = [],
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useFetch<ApiService[]>({
    endpoint: "services",
  });

  // State untuk menyimpan data yang sudah diproses
  const [topFreelancers, setTopFreelancers] = useState<ApiFreelancer[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);

  // Memproses data freelancer ketika data berubah
  useEffect(() => {
    if (freelancersData.length > 0) {
      // Filter hanya freelancer dan urutkan berdasarkan rating tertinggi
      const filteredFreelancers = freelancersData
        .filter((user: ApiFreelancer) => user.role === "freelancer")
        .sort((a: ApiFreelancer, b: ApiFreelancer) => b.rating - a.rating)
        .slice(0, 10); // Ambil 10 teratas

      setTopFreelancers(filteredFreelancers);
    }
  }, [freelancersData]);

  // Memproses data services ketika data berubah
  useEffect(() => {
    if (servicesData.length > 0 && freelancersData.length > 0) {
      // Menggabungkan data services dengan data freelancer
      const servicesWithFreelancerInfo = servicesData.map((service: ApiService) => {
        const freelancer = freelancersData.find((f: ApiFreelancer) => f._id === service.freelancerId);

        return {
          id: service._id,
          freelancerName: freelancer ? freelancer.fullName : "Unknown Freelancer",
          freelancerImage: freelancer ? freelancer.profileImage : "https://via.placeholder.com/150",
          title: service.title,
          price: `Rp${service.price.toLocaleString("id-ID")}`,
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
    }
  }, [servicesData, freelancersData]);

  // Update sections array dengan data yang sudah diproses
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
    <TouchableOpacity style={styles.serviceCard} onPress={() => navigation.navigate("ServiceDetails", { serviceId: item.id })}>
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
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
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
                <Plus size={26} color="#ffffff" strokeWidth={2.5} />
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
            <Search size={22} color={COLORS.gray} strokeWidth={2} />
            <Text style={styles.searchPlaceholder}>Search services or freelancers</Text>
          </TouchableOpacity>
        );

      case "projects":
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>

            {servicesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Loading services... 🔄</Text>
              </View>
            ) : servicesError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load services 😕</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetchServices()}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList<Service> data={item.data as Service[]} renderItem={renderService} keyExtractor={(item) => item.id.toString()} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll} />
            )}
          </View>
        );

      case "freelancers":
        return <TopFreelancer freelancers={topFreelancers} loading={freelancersLoading} error={freelancersError ? freelancersError.message : null} onRetry={refetchFreelancers} title={item.title || "Top Freelancers"} />;

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Worklytic" onRightComponentPress={() => navigation.navigate("Notifications")} />

      <FlatList<Section> data={sections} renderItem={renderSection} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} style={styles.content} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },

  // Search section
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "500",
  },

  // Section headers
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
    letterSpacing: 0.2,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Services list
  servicesScroll: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 8,
  },
  serviceCard: {
    width: 280,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    marginRight: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  serviceImage: {
    width: "100%",
    height: 170,
    resizeMode: "cover",
  },
  serviceInfo: {
    padding: 18,
  },
  freelancerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  freelancerThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  freelancerName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.darkGray,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 10,
    lineHeight: 24,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  serviceStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8, 145, 178, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginLeft: 6,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },

  // Post project section
  postProjectContainer: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: "rgba(8, 145, 178, 0.08)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(8, 145, 178, 0.15)",
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  postProjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  postProjectIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  postProjectText: {
    flex: 1,
  },
  postProjectTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 6,
  },
  postProjectDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.darkGray,
    fontWeight: "500",
  },

  // Loading and error states
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    height: 200,
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.gray,
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    height: 200,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    fontSize: 14,
    color: COLORS.background,
    fontWeight: "700",
  },
});
