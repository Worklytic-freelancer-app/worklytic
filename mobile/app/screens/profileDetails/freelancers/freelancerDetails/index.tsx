import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Mail, Phone, Calendar, ChevronLeft } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface Project {
  id: number;
  title: string;
  description: string;
  completionDate: string;
  clientName: string;
  image: string;
  category: string;
  budget: string;
  duration: string;
  status: string;
}

// First, add the Service interface near the top with other interfaces
interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
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
  
  const [freelancer, setFreelancer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchFreelancerData();
  }, [freelancerId]);
  
  const fetchFreelancerData = async () => {
    try {
      setLoading(true);
      const token = await SecureStoreUtils.getToken();
      
      const response = await fetch(`${baseUrl}/api/users/${freelancerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFreelancer(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch freelancer data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Format joined date from ISO string
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
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
          onPress={fetchFreelancerData}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        <TouchableOpacity 
          onPress={() => navigation.navigate("DirectMessage", {
            userId: freelancer._id,
            userName: freelancer.fullName,
            userImage: freelancer.profileImage,
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
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  about: {
    fontSize: 14,
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
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    color: "#fff",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
