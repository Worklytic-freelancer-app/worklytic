import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Mail, Phone, Calendar, ChevronLeft, Star } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";

// Updated Service interface to match API response
interface Service {
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
}

type FreelancerDetailsNavigationProp = StackNavigationProp<RootStackParamList>;
type FreelancerDetailsRouteProp = RouteProp<RootStackParamList, 'FreelancerDetails'>;

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage: string;
    location: string;
    balance: number;
    about: string;
    phone: string;
    skills: string[];
    totalProjects: number;
    successRate: number;
    website: string;
    rating: number;
    totalReviews: number;
    createdAt: string;
}

export default function FreelancerDetails() {
  const navigation = useNavigation<FreelancerDetailsNavigationProp>();
  const route = useRoute<FreelancerDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const { freelancerId } = route.params;
  
  // Menggunakan useFetch untuk data freelancer
  const { 
    data: freelancer, 
    isLoading: loading, 
    error: fetchError,
    refetch: refetchFreelancer
  } = useFetch<User>({
    endpoint: `users/${freelancerId}`,
    requiresAuth: true
  });
  
  // Menggunakan useFetch untuk layanan freelancer
  const {
    data: allServices,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices
  } = useFetch<Service[]>({
    endpoint: 'services',
    requiresAuth: true
  });
  
  // Filter layanan berdasarkan freelancerId
  const services = allServices?.filter(service => service.freelancerId === freelancerId) || [];
  
  // Format joined date from ISO string
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format price to Rupiah
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };
  
  const error = fetchError ? (fetchError instanceof Error ? fetchError.message : 'An error occurred') : null;
  
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Memuat data freelancer...</Text>
      </View>
    );
  }
  
  if (error || !freelancer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }, styles.errorContainer]}>
        <Text style={styles.errorText}>Gagal memuat data: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => refetchFreelancer()}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { serviceId: item._id })}
    >
      <Image 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/300' }} 
        style={styles.serviceImage}
      />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
        <View style={styles.serviceStats}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFC107" fill="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Freelancer Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <Image source={{ uri: freelancer.profileImage || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          <Text style={styles.name}>{freelancer.fullName}</Text>
          <Text style={styles.role}>{freelancer.skills && freelancer.skills.length > 0 ? freelancer.skills[0] : "Freelancer"}</Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>{freelancer.location || "Lokasi tidak tersedia"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>{freelancer.about || "Tidak ada deskripsi tersedia."}</Text>
        </View>

        

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color="#6B7280" />
              <Text style={styles.contactText}>{freelancer.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.contactText}>{freelancer.phone || "Nomor telepon tidak tersedia"}</Text>
            </View>
            <View style={styles.contactItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.contactText}>Joined {freelancer.createdAt ? formatJoinedDate(freelancer.createdAt) : "Unknown"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {freelancer.skills && freelancer.skills.length > 0 ? (
              freelancer.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Belum ada skill yang ditambahkan</Text>
            )}
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {servicesLoading ? (
            <View style={styles.servicesLoadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Memuat layanan...</Text>
            </View>
          ) : servicesError ? (
            <View style={styles.servicesErrorContainer}>
              <Text style={styles.errorText}>Gagal memuat layanan: {servicesError.message}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetchServices()}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : services.length === 0 ? (
            <Text style={styles.noDataText}>Freelancer belum memiliki layanan</Text>
          ) : (
            <FlatList
              data={services}
              renderItem={renderService}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesContainer}
            />
          )}
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate("DirectMessage", {
            userId: freelancer._id,
            userName: freelancer.fullName,
            userImage: freelancer.profileImage,
            chatId: `freelancer_${freelancer._id}`
          })} 
          style={[styles.hireButton, { backgroundColor: "#2563EB" }]}
        >
          <Text style={styles.hireButtonText}>Chat</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profile: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  about: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },
  contactInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: "#2563EB",
  },
  hireButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  hireButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noDataText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  // Services styles
  servicesContainer: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  servicesLoadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  servicesErrorContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  serviceCard: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    height: 150,
    resizeMode: "cover",
  },
  serviceContent: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },
  serviceStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
