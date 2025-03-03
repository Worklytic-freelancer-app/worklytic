import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star, Clock, MessageCircle } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useMemo } from "react";
import { useFetch } from "@/hooks/tanstack/useFetch";

type ServiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ServiceDetailScreenRouteProp = RouteProp<RootStackParamList, "ServiceDetails">;

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
}

interface ApiFreelancer {
  _id: string;
  fullName: string;
  profileImage: string;
  skills: string[];
  rating: number;
  role: string;
  totalProjects?: number;
}

export default function ServiceDetails() {
  const navigation = useNavigation<ServiceDetailScreenNavigationProp>();
  const route = useRoute<ServiceDetailScreenRouteProp>();
  const { serviceId } = route.params;
  
  // Fetch service details
  const { 
    data: service, 
    isLoading: serviceLoading, 
    error: serviceError,
    refetch: refetchService
  } = useFetch<ApiService>({
    endpoint: `services/${serviceId}`,
    requiresAuth: true
  });
  
  // Fetch freelancer details jika service sudah diload
  const {
    data: freelancer,
    isLoading: freelancerLoading,
    error: freelancerError,
    refetch: refetchFreelancer
  } = useFetch<ApiFreelancer>({
    endpoint: service ? `users/${service.freelancerId}` : '',
    requiresAuth: true,
    enabled: !!service // Hanya fetch jika service sudah ada
  });
  
  const loading = serviceLoading || (!!service && freelancerLoading);
  
  // Gabungkan error dari service dan freelancer
  const error = useMemo(() => {
    if (serviceError) {
      return serviceError instanceof Error ? serviceError.message : 'Failed to fetch service details';
    }
    if (service && freelancerError) {
      return freelancerError instanceof Error ? freelancerError.message : 'Failed to fetch freelancer details';
    }
    return null;
  }, [serviceError, freelancerError, service]);
  
  // Retry function untuk mencoba fetch ulang
  const handleRetry = () => {
    refetchService();
    if (service) {
      refetchFreelancer();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading service details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Service not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <Image 
          source={{ uri: service.images[0] || "https://via.placeholder.com/400" }} 
          style={styles.coverImage} 
        />

        <View style={styles.content}>
          {freelancer && (
            <TouchableOpacity 
              style={styles.freelancerSection}
              onPress={() => navigation.navigate("FreelancerDetails", { 
                freelancerId: freelancer._id 
              })}
            >
              <Image 
                source={{ uri: freelancer.profileImage || "https://via.placeholder.com/150" }} 
                style={styles.freelancerImage} 
              />
              <View style={styles.freelancerInfo}>
                <Text style={styles.freelancerName}>{freelancer.fullName}</Text>
                <Text style={styles.freelancerRole}>{freelancer.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigation.navigate("DirectMessage", {
                  userId: freelancer._id,
                  userName: freelancer.fullName,
                  userImage: freelancer.profileImage,
                  chatId: `freelancer_${freelancer._id}`
                })} 
              >
                <MessageCircle size={20} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{service.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statText}>
                {service.rating} ({service.reviews} reviews)
              </Text>
            </View>
            <View style={styles.stat}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.statText}>{service.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {service.includes.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {service.requirements.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>Rp{service.price.toLocaleString('id-ID')}</Text>
        </View>
        <TouchableOpacity
          style={styles.hireMeButton}
          onPress={() => {
            // Handle hire action
          }}
        >
          <Text style={styles.hireMeButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  coverImage: {
    width: "100%",
    height: 240,
  },
  content: {
    padding: 20,
  },
  freelancerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  freelancerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  freelancerInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  freelancerRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  chatButton: {
    backgroundColor: "#0891b2",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4b5563",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  listDot: {
    fontSize: 16,
    color: "#6b7280",
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: "#4b5563",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0891b2",
  },
  hireMeButton: {
    backgroundColor: "#0891b2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  hireMeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0891b2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  backButtonText: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "600",
  },
});
