import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import ImageWithSkeleton from '@/components/ImageWithSkeleton';
import SkeletonServices from './SkeletonServices';

type ServicesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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

export default function Services() {
  const navigation = useNavigation<ServicesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Menggunakan useFetch untuk services
  const { 
    data: apiServices, 
    isLoading: servicesLoading, 
    error: servicesError,
    refetch: refetchServices
  } = useFetch<ApiService[]>({
    endpoint: 'services',
    requiresAuth: true
  });
  
  // Menggunakan useFetch untuk freelancers
  const {
    data: apiFreelancers,
    isLoading: freelancersLoading,
    error: freelancersError
  } = useFetch<ApiFreelancer[]>({
    endpoint: 'users',
    requiresAuth: true
  });
  
  // Menggabungkan data services dengan data freelancer
  const services: Service[] = useMemo(() => {
    if (!apiServices || !apiFreelancers) return [];
    
    return apiServices.map(service => {
      const freelancer = apiFreelancers.find(f => f._id === service.freelancerId);
      
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
  }, [apiServices, apiFreelancers]);
  
  // Filter services berdasarkan search query
  const filteredServices = useMemo(() => {
    if (searchQuery.trim() === "") {
      return services;
    } else {
      return services.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [searchQuery, services]);
  
  const loading = servicesLoading || freelancersLoading;
  const error = servicesError || freelancersError;
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { serviceId: item.id })}
    >
      <ImageWithSkeleton 
        source={{ uri: item.image }} 
        style={styles.serviceImage} 
      />
      <View style={styles.serviceInfo}>
        <View style={styles.freelancerInfo}>
          <ImageWithSkeleton 
            source={{ uri: item.freelancerImage }} 
            style={styles.freelancerThumb} 
          />
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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {searchQuery.trim() !== "" ? (
        <>
          <Text style={styles.emptyTitle}>No services found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any services matching "{searchQuery}"
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyText}>No services available at the moment</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services"
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <SkeletonServices />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchServices()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#111827",
  },
  servicesList: {
    padding: 20,
    flexGrow: 1,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  serviceImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  serviceInfo: {
    padding: 16,
  },
  freelancerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: "#0891b2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
