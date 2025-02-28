import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useEffect, useState } from "react";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
type ProjectsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AssignedFreelancer {
  _id: string;
  fullName: string;
  profileImage: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  duration: string;
  status: string;
  requirements: string[];
  image: string[];
  assignedFreelancer: AssignedFreelancer[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export default function Projects() {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = await SecureStoreUtils.getToken();  
      const response = await fetch(`${baseUrl}/api/projects`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard} 
      onPress={() => navigation.navigate("ProjectDetails", { projectId: item._id })}
    >
      <Image 
        source={{ uri: item.image[0] }} 
        style={styles.projectImage} 
      />
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectBudget}>{formatBudget(item.budget)}</Text>
        </View>
        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.projectFooter}>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              { color: item.status === "Open" ? "#059669" : "#9333EA" }
            ]}>
              {item.status}
            </Text>
            {item.progress > 0 && (
              <Text style={styles.progressText}>{item.progress}% Complete</Text>
            )}
          </View>
          <Text style={styles.projectLocation}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <Text style={styles.searchPlaceholder}>Search projects</Text>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.projectsList}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    color: "#6b7280",
  },
  projectsList: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  projectInfo: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  projectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  projectCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
  },
  projectLocation: {
    fontSize: 14,
    color: "#6b7280",
  },
});
