import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Star, MapPin, Filter, ChevronLeft,ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface Freelancer {
  id: string;
  name: string;
  role: string;
  rating: number;
  hourlyRate: string;
  location: string;
  skills: string[];
  image: string;
}

interface ApiFreelancer {
    _id: string;
    fullName: string;
    profileImage: string;
    skills: string[];
    rating: number;
    role: string;
    location: string;
    hourlyRate?: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

type FreelancersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Freelancers() {
    const navigation = useNavigation<FreelancersScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");
    const [freelancers, setFreelancers] = useState<ApiFreelancer[]>([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState<ApiFreelancer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFreelancers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredFreelancers(freelancers);
        } else {
            const filtered = freelancers.filter(
                (freelancer) =>
                    freelancer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (freelancer.skills && 
                     freelancer.skills.some(skill => 
                        skill.toLowerCase().includes(searchQuery.toLowerCase())
                     ))
            );
            setFilteredFreelancers(filtered);
        }
    }, [searchQuery, freelancers]);

    const fetchFreelancers = async () => {
        try {
            setLoading(true);
            const token = await SecureStoreUtils.getToken();
            
            const response = await fetch(`${baseUrl}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json() as ApiResponse<ApiFreelancer[]>;
            
            if (result.success) {
                // Filter hanya freelancer dan urutkan berdasarkan rating tertinggi
                const allFreelancers = result.data
                    .filter((user: ApiFreelancer) => user.role === 'freelancer')
                    .sort((a: ApiFreelancer, b: ApiFreelancer) => b.rating - a.rating);
                
                setFreelancers(allFreelancers);
                setFilteredFreelancers(allFreelancers);
            } else {
                setError(result.message || 'Failed to fetch freelancers');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching freelancers:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderFreelancer = ({ item }: { item: ApiFreelancer }) => (
        <TouchableOpacity 
            style={styles.freelancerCard}
            onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item._id })}
        >
            <Image 
                source={{ uri: item.profileImage || "https://via.placeholder.com/150" }} 
                style={styles.freelancerImage} 
            />
            <View style={styles.freelancerInfo}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.role}>
                    {item.skills && item.skills.length > 0 ? item.skills[0] : "Freelancer"}
                </Text>
                
                <View style={styles.ratingContainer}>
                    <Star size={16} color="#FDB022" fill="#FDB022" />
                    <Text style={styles.rating}>{item.rating || 0}</Text>
                </View>

                <View style={styles.locationContainer}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.location}>{item.location || "Lokasi tidak tersedia"}</Text>
                </View>

                <Text style={styles.hourlyRate}>
                    {item.hourlyRate ? `Rp ${item.hourlyRate.toLocaleString('id-ID')}/jam` : "Rate tidak tersedia"}
                </Text>

                <View style={styles.skillsContainer}>
                    {item.skills && item.skills.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.skillBadge}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
            </View>
    
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Freelancers</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari freelancer atau skill..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredFreelancers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada freelancer yang ditemukan</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFreelancers}
          renderItem={renderFreelancer}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        fontSize: 16,
        color: "#111827",
    },
    listContainer: {
        padding: 20,
    },
    freelancerCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    freelancerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    freelancerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        color: "#111827",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    location: {
        marginLeft: 4,
        fontSize: 14,
        color: "#6B7280",
    },
    hourlyRate: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2563EB",
        marginBottom: 8,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    skillBadge: {
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    skillText: {
        fontSize: 12,
        color: "#2563EB",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: '#ffffff',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    }
});