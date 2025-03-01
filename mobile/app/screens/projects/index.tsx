import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter, ChevronLeft } from "lucide-react-native";
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

interface Client {
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

interface ProjectWithClient extends Project {
  client?: Client;
}

export default function Projects() {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);

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
        // Fetch client details for each project
        const projectsWithClients = await Promise.all(
          result.data.map(async (project: Project) => {
            try {
              const clientResponse = await fetch(`${baseUrl}/api/users/${project.clientId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const clientResult = await clientResponse.json();
              return {
                ...project,
                client: clientResult.success ? clientResult.data : undefined
              };
            } catch (error) {
              console.error('Error fetching client:', error);
              return project;
            }
          })
        );
        setProjects(projectsWithClients);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 hari yang lalu";
    if (diffDays < 30) return `${diffDays} hari yang lalu`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan yang lalu`;
    }
    return `${Math.floor(diffDays / 365)} tahun yang lalu`;
  };

  const renderProject = ({ item }: { item: ProjectWithClient }) => (
    <TouchableOpacity 
      style={styles.projectCard} 
      onPress={() => navigation.navigate("ProjectDetails", { 
        projectId: item._id,
        clientId: item.clientId 
      })}
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

        {item.client && (
          <View style={styles.clientContainer}>
            <Image 
              source={{ uri: item.client.profileImage }} 
              style={styles.clientImage} 
            />
            <View>
              <Text style={styles.clientName}>{item.client.fullName}</Text>
              <Text style={styles.projectLocation}>{item.location}</Text>
            </View>
          </View>
        )}

        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.assignedFreelancer.length > 0 && (
          <View style={styles.assignedFreelancerContainer}>
            <View style={styles.freelancerImages}>
              {item.assignedFreelancer.slice(0, 3).map((freelancer, index) => (
                <Image 
                  key={`${item._id}-freelancer-${freelancer._id}`}
                  source={{ uri: freelancer.profileImage }} 
                  style={[
                    styles.freelancerImage,
                    { marginLeft: index > 0 ? -12 : 0 }
                  ]} 
                />
              ))}
              {item.assignedFreelancer.length > 3 && (
                <View style={styles.extraFreelancers}>
                  <Text style={styles.extraFreelancersText}>
                    +{item.assignedFreelancer.length - 3}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.freelancerCount}>
              {item.assignedFreelancer.length} freelancer{item.assignedFreelancer.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

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
          <Text style={styles.postedDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Projects</Text>
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  assignedFreelancerContainer: {
    marginVertical: 8,
  },
  freelancerImages: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  freelancerImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  extraFreelancers: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  extraFreelancersText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  freelancerCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  postedDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
});
