import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ProjectsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Projects() {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  interface Project {
    id: string;
    title: string;
    budget: string;
    category: string;
    postedBy: string;
    image: string;
    description: string;
    postedTime: string;
  }

  const projects: Project[] = [
    {
      id: "1",
      title: "Mobile App Development",
      budget: "Rp 37.500.000",
      category: "Development",
      postedBy: "Tech Solutions Inc.",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
      description: "Looking for an experienced mobile developer to create a modern, user-friendly application...",
      postedTime: "2 hours ago",
    },
    {
      id: "2",
      title: "Website Redesign",
      budget: "Rp 27.000.000",
      category: "Design",
      postedBy: "Creative Agency",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
      description: "Need a talented designer to revamp our company website with modern aesthetics...",
      postedTime: "5 hours ago",
    },
  ];

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard} onPress={() => navigation.navigate("ProjectDetails", { projectId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectBudget}>{item.budget}</Text>
        </View>
        <Text style={styles.projectCategory}>{item.category}</Text>
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.projectFooter}>
          <Text style={styles.projectPoster}>{item.postedBy}</Text>
          <Text style={styles.projectTime}>{item.postedTime}</Text>
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

      <FlatList<Project> data={projects} renderItem={renderProject} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.projectsList} showsVerticalScrollIndicator={false} />
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
  projectPoster: {
    fontSize: 14,
    color: "#6b7280",
  },
  projectTime: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
