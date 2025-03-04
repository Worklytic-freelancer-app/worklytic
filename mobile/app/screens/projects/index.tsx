import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter, ChevronLeft, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useFetch } from "@/hooks/tanstack/useFetch";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SkeletonProject from "./SkeletonProject";
import { COLORS } from "@/constant/color";

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
  
  // Fetch projects dengan TanStack Query
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects
  } = useFetch<Project[]>({
    endpoint: 'projects',
    requiresAuth: true
  });
  
  // Fetch users untuk mendapatkan data client
  const { 
    data: users = [], 
    isLoading: usersLoading,
    error: usersError
  } = useFetch<Client[]>({
    endpoint: 'users',
    requiresAuth: true
  });
  
  // Gabungkan data projects dengan client
  const projectsWithClients: ProjectWithClient[] = projects.map(project => {
    const client = users.find(user => user._id === project.clientId);
    return {
      ...project,
      client
    };
  });
  
  const isLoading = projectsLoading || usersLoading;
  const error = projectsError || usersError;

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
      <ImageWithSkeleton 
        source={{ uri: item.image[0] }} 
        style={styles.projectImage}
        skeletonStyle={{ width: "100%", height: 160 }}
      />
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text style={styles.projectBudget}>{formatBudget(item.budget)}</Text>
          </View>
        </View>

        {item.client && (
          <View style={styles.clientContainer}>
            <ImageWithSkeleton 
              source={{ uri: item.client.profileImage }} 
              style={styles.clientImage}
              skeletonStyle={{ borderRadius: 16 }}
            />
            <View>
              <Text style={styles.clientName}>{item.client.fullName}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={COLORS.gray} />
                <Text style={styles.projectLocation}>{item.location}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.assignedFreelancer?.length > 0 && (
          <View style={styles.assignedFreelancerContainer}>
            <View style={styles.freelancerImages}>
              {item.assignedFreelancer.map((freelancer, index) => (
                index < 3 && (
                  <ImageWithSkeleton 
                    key={freelancer._id}
                    source={{ uri: freelancer.profileImage }} 
                    style={[
                      styles.freelancerImage,
                      { marginLeft: index > 0 ? -12 : 0 }
                    ]}
                    skeletonStyle={{ borderRadius: 14 }}
                  />
                )
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
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === "Open" ? `${COLORS.success}15` : `${COLORS.primary}15` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === "Open" ? COLORS.success : COLORS.primary }
              ]}>
                {item.status}
              </Text>
            </View>
            {item.progress > 0 && (
              <Text style={styles.progressText}>{item.progress}% Complete</Text>
            )}
          </View>
          <Text style={styles.postedDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Buat fungsi handleRefresh yang terpisah
  const handleRefresh = async () => {
    console.log('🔄 Starting refresh...');
    try {
      await refetchProjects();
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.log('❌ Refresh failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Projects</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <Text style={styles.searchPlaceholder}>Search projects</Text>
        </View>
        <SkeletonProject />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Projects</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.gray} />
        <Text style={styles.searchPlaceholder}>Search projects</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(error as Error).message || "Terjadi kesalahan saat memuat data"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchProjects()}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projectsWithClients}
          renderItem={renderProject}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.projectsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor={COLORS.background}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada project yang tersedia</Text>
            </View>
          }
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  projectImage: {
    width: "100%",
    height: 160,
  },
  projectInfo: {
    padding: 16,
  },
  titleContainer: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.success,
  },
  projectCategory: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
    fontWeight: "500",
  },
  projectDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
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
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  assignedFreelancerContainer: {
    marginVertical: 12,
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 12,
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.inputBackground,
    padding: 8,
    borderRadius: 12,
  },
  clientImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
