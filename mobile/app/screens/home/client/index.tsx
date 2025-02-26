import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Bell, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ClientScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Client() {
  const navigation = useNavigation<ClientScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  interface Project {
    id: number;
    title: string;
    budget: string;
    category: string;
    status: string;
    applicants: number;
    image: string;
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
    type: "search" | "post-project" | "projects" | "freelancers";
    title?: string;
    data?: Project[] | Freelancer[];
  }

  const myProjects: Project[] = [
    {
      id: 1,
      title: "Mobile App Development",
      budget: "Rp 37.500.000",
      category: "Development",
      status: "Open",
      applicants: 5,
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Website Redesign",
      budget: "Rp 27.000.000",
      category: "Design",
      status: "Open",
      applicants: 3,
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
    },
  ];

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
    {
      id: "post-project",
      type: "post-project",
    },
    {
      id: "projects",
      type: "projects",
      title: "My Posted Projects",
      data: myProjects,
    },
    {
      id: "freelancers",
      type: "freelancers",
      title: "Top Freelancers",
      data: topFreelancers,
    },
  ];

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard} onPress={() => navigation.navigate("ProjectDetails", { projectId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectBudget}>{item.budget}</Text>
        <View style={styles.projectStats}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.applicantsText}>{item.applicants} Applicants</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFreelancer = ({ item }: { item: Freelancer }) => (
    <TouchableOpacity style={styles.freelancerCard} onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item.id })}>
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
            <Text style={styles.searchPlaceholder}>Search freelancers</Text>
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
            <FlatList<Project> data={item.data as Project[]} renderItem={renderProject} keyExtractor={(item) => item.id.toString()} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll} />
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
    marginTop: 8
  },
  rating: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500"
  }
});
