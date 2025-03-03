import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell, MapPin, Star, Briefcase, FileText, MessageSquare, Clock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import TopFreelancer from "../TopFreelancer";
import { useFetch } from "@/hooks/tanstack/useFetch";

type FreelancerScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  duration: string;
  status: string;
  image: string[];
  clientId: string;
}

// Interface untuk freelancer dari API
interface ApiFreelancer {
  _id: string;
  fullName: string;
  profileImage: string;
  skills: string[];
  rating: number;
  role: string;
}

interface Section {
  id: string;
  type: "search" | "balance" | "features" | "projects" | "freelancers";
  title?: string;
  data?: Project[] | ApiFreelancer[];
}

export default function Freelancer() {
  const navigation = useNavigation<FreelancerScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  
  // Gunakan useFetch untuk mendapatkan data proyek
  const { 
    data: recommendedProjects = [], 
    isLoading: loading,
    error: projectsError
  } = useFetch<Project[]>({
    endpoint: 'projects/recommendations',
    requiresAuth: true
  });
  
  // Gunakan useFetch untuk mendapatkan data freelancer
  const { 
    data: users = [], 
    isLoading: freelancersLoading, 
    error: freelancersError,
    refetch: fetchTopFreelancers
  } = useFetch<ApiFreelancer[]>({
    endpoint: 'users',
    requiresAuth: true
  });
  
  // Filter hanya freelancer dan urutkan berdasarkan rating tertinggi
  const topFreelancers = users
    .filter(user => user.role === 'freelancer')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10); // Ambil 10 teratas

  const sections: Section[] = [
    {
      id: "search",
      type: "search",
    },
    // Hanya tampilkan section rekomendasi jika ada projects yang sesuai
    ...(recommendedProjects.length > 0 ? [{
      id: "projects",
      type: "projects" as const,
      title: "Recommended for You",
      data: recommendedProjects,
    }] : []),
    {
      id: "features",
      type: "features" as const,
    },
    {
      id: "freelancers",
      type: "freelancers" as const,
      title: "Top Freelancers",
      data: topFreelancers,
    },
  ];

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard} 
      onPress={() => navigation.navigate("ProjectDetails", { projectId: item._id, clientId: item.clientId })}
    >
      <Image 
        source={{ uri: item.image[0] || 'https://via.placeholder.com/280x140' }} 
        style={styles.projectImage} 
      />
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectBudget}>
          Rp{item.budget.toLocaleString('id-ID')}
        </Text>
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.projectLocation}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ item }: { item: Section }) => {
    switch (item.type) {
      case "search":
        return (
          <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate("Search")}>
            <Search size={20} color="#6b7280" />
            <Text style={styles.searchPlaceholder}>Search projects or freelancers</Text>
          </TouchableOpacity>
        );

      case "projects":
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : projectsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {(projectsError as Error).message || "Failed to load projects"}
                </Text>
              </View>
            ) : (
              <FlatList<Project> 
                data={item.data as Project[]} 
                renderItem={renderProject} 
                keyExtractor={(item) => item._id} 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.projectsScroll} 
              />
            )}
          </View>
        );

      case "freelancers":
        return (
          <TopFreelancer
            freelancers={topFreelancers}
            loading={freelancersLoading}
            error={freelancersError ? (freelancersError as Error).message : null}
            onRetry={fetchTopFreelancers}
            title={item.title || "Top Freelancers"}
          />
        );

      case "features":
        return (
          <View style={styles.featuresContainer}>
            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate("Projects")}>
              <View style={[styles.featureIcon, { backgroundColor: "#dbeafe" }]}>
                <Briefcase size={24} color="#2563eb" />
              </View>
              <Text style={styles.featureText}>Find Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem} onPress={() => console.log("My Proposals")}>
              <View style={[styles.featureIcon, { backgroundColor: "#dcfce7" }]}>
                <FileText size={24} color="#059669" />
              </View>
              <Text style={styles.featureText}>My Proposals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem} onPress={() => console.log("Messages")}>
              <View style={[styles.featureIcon, { backgroundColor: "#fef3c7" }]}>
                <MessageSquare size={24} color="#d97706" />
              </View>
              <Text style={styles.featureText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureItem} onPress={() => console.log("History")}>
              <View style={[styles.featureIcon, { backgroundColor: "#f3e8ff" }]}>
                <Clock size={24} color="#7c3aed" />
              </View>
              <Text style={styles.featureText}>History</Text>
            </TouchableOpacity>
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
    backgroundColor: "#f9fafb",
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
  },
  username: {
    fontSize: 16,
    color: "#6b7280",
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
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  featureItem: {
    alignItems: "center",
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
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
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
});
