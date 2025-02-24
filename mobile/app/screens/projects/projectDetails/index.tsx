import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Clock, DollarSign, Briefcase, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

interface ProjectDetails {
  id: number;
  title: string;
  budget: string;
  category: string;
  location: string;
  duration: string;
  postedBy: {
    name: string;
    image: string;
    rating: number;
  };
  description: string;
  requirements: string[];
  image: string;
}

export default function ProjectDetails() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const project: ProjectDetails = {
    id: 1,
    title: "Mobile App Development",
    budget: "Rp 37.500.000",
    category: "Development",
    location: "Remote",
    duration: "3 months",
    postedBy: {
      name: "Tech Solutions Inc.",
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
      rating: 4.8,
    },
    description:
      "Looking for an experienced mobile developer to create a modern, user-friendly application. The project involves building both iOS and Android versions using React Native. The app will include features such as user authentication, real-time messaging, and integration with REST APIs.",
    requirements: ["5+ years of mobile development experience", "Strong knowledge of React Native", "Experience with REST APIs", "Good understanding of UI/UX principles", "Excellent communication skills"],
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: project.image }} style={styles.projectImage} />

        <View style={styles.projectInfo}>
          <Text style={styles.title}>{project.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#e0f2fe" }]}>
                <DollarSign size={20} color="#0284c7" />
              </View>
              <View>
                <Text style={styles.statLabel}>Budget</Text>
                <Text style={styles.statValue}>{project.budget}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <Clock size={20} color="#d97706" />
              </View>
              <View>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{project.duration}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
                <MapPin size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.statLabel}>Location</Text>
                <Text style={styles.statValue}>{project.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {project.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.posterContainer}>
              <Image source={{ uri: project.postedBy.image }} style={styles.posterImage} />
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>{project.postedBy.name}</Text>
                <Text style={styles.posterRating}>⭐️ {project.postedBy.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  projectImage: {
    width: "100%",
    height: 200,
  },
  projectInfo: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: "#4b5563",
  },
  posterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  posterImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  posterRating: {
    fontSize: 14,
    color: "#6b7280",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  applyButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
