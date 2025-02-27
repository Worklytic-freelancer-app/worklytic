import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type ClientScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Add Freelancer interface
interface Freelancer {
  id: number;
  name: string;
  role: string;
  rating: number;
  image: string;
}

// Move Service interface to top with other interfaces
interface Service {
  id: number;
  freelancerName: string;
  freelancerImage: string;
  title: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
}

// Add Section interface
interface Section {
  id: string;
  type: "search" | "post-project" | "projects" | "freelancers";
  title?: string;
  data?: Freelancer[] | Service[];
}

export default function Client() {
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log("BottomTab rendered");
    console.log("SecureStore", SecureStore.getItemAsync("token"));
  }, []);

  const services: Service[] = [
    {
      id: 1,
      freelancerName: "John Doe",
      freelancerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      title: "Mobile App Development",
      price: "Rp5.000.000",
      rating: 4.8,
      reviews: 25,
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      freelancerName: "Jane Smith",
      freelancerImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60",
      title: "Web Development",
      price: "Rp4.000.000",
      rating: 4.9,
      reviews: 32,
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
    },
  ];

  // Update sections array to use services
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
      data: services,
    },
    {
      id: "freelancers",
      type: "freelancers",
      title: "Top Freelancers",
      data: [
        {
          id: 1,
          name: "John Doe",
          role: "Mobile Developer",
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        },
        {
          id: 2,
          name: "Jane Smith",
          role: "Web Developer",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60",
        },
      ],
    },
  ];

  // Move renderService before it's used
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
            <Text style={styles.rating}>⭐️ {item.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Update renderSection's projects case
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
            <FlatList<Service> data={item.data as Service[]} renderItem={renderService} keyExtractor={(item) => item.id.toString()} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll} />
          </View>
        );

      case "freelancers":
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Freelancers")}>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList<Freelancer>
              data={item.data as Freelancer[]}
              renderItem={({ item }: { item: Freelancer }) => (
                <TouchableOpacity style={styles.freelancerCard} onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item.id })}>
                  <Image source={{ uri: item.image }} style={styles.freelancerImage} />
                  <Text style={styles.freelancerName}>{item.name}</Text>
                  <Text style={styles.freelancerRole}>{item.role}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐️ {item.rating}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freelancersScroll}
            />
          </View>
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

      <FlatList<Section> data={sections} renderItem={renderSection} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} style={styles.content} />
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
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    color: "#6b7280",
  },
  postProjectContainer: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
  },
  postProjectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  postProjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  postProjectText: {
    flex: 1,
  },
  postProjectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  postProjectDescription: {
    fontSize: 14,
    color: "#e5e7eb",
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
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
    marginBottom: 18,
  },
  projectsScroll: {
    paddingLeft: 20,
    paddingBottom: 8,
  },
  projectCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 8,
  },
  projectStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  applicantsText: {
    fontSize: 12,
    color: "#6b7280",
  },
  freelancersScroll: {
    paddingLeft: 20,
    paddingBottom: 8,
  },
  freelancerCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  freelancerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  freelancerRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  rating: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  serviceCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 8,
  },
  serviceStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewsText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  servicesScroll: {
    paddingLeft: 20,
    paddingBottom: 8,
  },
});
