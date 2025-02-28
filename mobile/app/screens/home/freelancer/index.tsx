import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { useEffect, useState } from "react";
import { SecureStoreUtils } from "@/utils/SecureStore";

type FreelancerScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Freelancer() {
  const navigation = useNavigation<FreelancerScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    console.log(recommendedProjects, "recommendedProjects");
  }, []);

  const fetchProjects = async () => {
    try {
      const token = await SecureStoreUtils.getToken();
      const response = await fetch(`${baseUrl}/api/projects/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setRecommendedProjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

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

  interface Freelancer {
    id: number;
    name: string;
    role: string;
    rating: number;
    image: string;
  }

  interface Section {
    id: string;
    type: "search" | "balance" | "features" | "projects" | "freelancers";
    title?: string;
    data?: Project[] | Freelancer[];
  }

  const topFreelancers: Freelancer[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "UI/UX Designer",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      name: "Michael Ross",
      role: "Full Stack Developer",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
    },
  ];

  const sections: Section[] = [
    {
      id: "search",
      type: "search",
    },
    // ! Cari tau kenapa harus as const
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
        <Text style={styles.projectLocation}>📍 {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFreelancer = ({ item }: { item: Freelancer }) => (
      <TouchableOpacity style={styles.freelancerCard} onPress={() => console.log("Freelancer Card Pressed")}>
      <Image source={{ uri: item.image }} style={styles.freelancerImage} />
      <Text style={styles.freelancerName}>{item.name}</Text>
      <Text style={styles.freelancerRole}>{item.role}</Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐️ {item.rating}</Text>
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
            <FlatList<Project> data={item.data as Project[]} renderItem={renderProject} keyExtractor={(item) => item._id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll} />
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
              renderItem={renderFreelancer}
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
  balanceContainer: {
    backgroundColor: "#1a237e",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffd700",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  balanceIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a237e",
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  balanceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceButtonText: {
    fontSize: 18,
    color: "#ffffff",
  },
  incomeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 16,
    marginBottom: 16,
  },
  incomeItem: {
    marginBottom: 8,
  },
  incomeLabel: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  statisticsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statisticItem: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statisticLabel: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 4,
  },
  statisticValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
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
  subGreeting: {
    fontSize: 15,
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
  projectLocation: {
    fontSize: 14,
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
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d97706",
  },
});
