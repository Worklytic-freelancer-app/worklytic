import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Mail, Phone, Calendar, ChevronLeft, Star } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";
import SkeletonFreelancerDetails from "./SkeletonFreelancerDetails";
import ImageWithSkeleton from '@/components/ImageWithSkeleton';

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

// Tambahkan fungsi generateChatId
const generateChatId = (userId1: string, userId2: string) => {
  // Urutkan ID agar format selalu konsisten
  return [userId1, userId2].sort().join('_');
};

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
  
  const { data: user } = useUser();

  // Modifikasi handler untuk tombol chat
  const handleStartChat = () => {
    if (!user?._id || !freelancer) return;

    // Generate chatId yang konsisten
    const chatId = generateChatId(user._id, freelancer._id);

    navigation.navigate("DirectMessage", {
      userId: freelancer._id,
      userName: freelancer.fullName,
      userImage: freelancer.profileImage,
      chatId: chatId // Gunakan chatId yang sudah digenerate
    });
  };

  if (loading || servicesLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Freelancer</Text>
          <View style={{ width: 40 }} />
        </View>
        <SkeletonFreelancerDetails />
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
      <ImageWithSkeleton 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/300' }} 
        style={styles.serviceImage}
        skeletonStyle={{ marginBottom: 16 }}
      />
      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
        <View style={styles.serviceStats}>
          <View style={styles.ratingContainer}>
            <Star size={14} color={COLORS.primary} fill={COLORS.primary} />
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
          <ChevronLeft size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Freelancer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <ImageWithSkeleton 
            source={{ uri: freelancer.profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage}
            skeletonStyle={{ marginBottom: 16 }}
          />
          <Text style={styles.name}>{freelancer.fullName}</Text>
          <Text style={styles.role}>
            {freelancer.skills && freelancer.skills.length > 0 ? freelancer.skills[0] : "Freelancer"}
          </Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={COLORS.gray} />
            <Text style={styles.location}>{freelancer.location || "Lokasi tidak tersedia"}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{services.length || 0}</Text>
              <Text style={styles.statsLabel}>Total Services</Text>
            </View>
            {/* <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{freelancer.successRate || 0}%</Text>
              <Text style={styles.statsLabel}>Tingkat Sukses</Text>
            </View> */}
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{freelancer.rating || 0}</Text>
              <Text style={styles.statsLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.paddedSection}>
          <Text style={styles.sectionTitle}>Tentang</Text>
          <Text style={styles.about}>{freelancer.about || "Tidak ada deskripsi tersedia."}</Text>
        </View>

        <View style={styles.paddedSection}>
          <Text style={styles.sectionTitle}>Informasi Kontak</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>{freelancer.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>{freelancer.phone || "Nomor telepon tidak tersedia"}</Text>
            </View>
            <View style={styles.contactItem}>
              <Calendar size={16} color={COLORS.gray} />
              <Text style={styles.contactText}>
                Bergabung {freelancer.createdAt ? formatJoinedDate(freelancer.createdAt) : "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paddedSection}>
          <Text style={styles.sectionTitle}>Keahlian</Text>
          <View style={styles.skillsContainer}>
            {freelancer.skills && freelancer.skills.length > 0 ? (
              freelancer.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Belum ada keahlian yang ditambahkan</Text>
            )}
          </View>
        </View>

        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, styles.paddedHorizontal]}>Layanan</Text>
          {servicesError ? (
            <View style={styles.paddedHorizontal}>
              <Text style={styles.errorText}>Gagal memuat layanan</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => refetchServices()}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : services.length === 0 ? (
            <Text style={[styles.noDataText, styles.paddedHorizontal]}>
              Freelancer belum memiliki layanan
            </Text>
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

        <View style={styles.paddedSection}>
          <TouchableOpacity 
            onPress={handleStartChat}
            style={styles.chatButton}
          >
            <Text style={styles.chatButtonText}>Mulai Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  profileSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  statsCard: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  about: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.darkGray,
  },
  contactInfo: {
    backgroundColor: COLORS.inputBackground,
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
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  chatButton: {
    // marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.background,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.background,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 8,
  },
  servicesSection: {
    marginBottom: 24,
  },
  servicesContainer: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  serviceCard: {
    width: 280,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.black,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
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
    color: COLORS.gray,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  paddedSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paddedHorizontal: {
    paddingHorizontal: 20,
  },
});
