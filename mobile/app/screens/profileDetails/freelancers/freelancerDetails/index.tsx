import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, MapPin, Mail, Phone, Calendar, ChevronLeft, ExternalLink } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

interface Project {
  id: number;
  title: string;
  description: string;
  completionDate: string;
  clientName: string;
  image: string;
}

interface Portfolio {
  id: number;
  title: string;
  image: string;
  link: string;
}

export default function FreelancerDetails() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const freelancer = {
    id: 1,
    name: "John Doe",
    role: "Senior Mobile Developer",
    rating: 4.8,
    totalProjects: 47,
    hourlyRate: "Rp 500.000",
    location: "Jakarta, Indonesia",
    joinedDate: "January 2022",
    about: "Experienced mobile developer with 5+ years of expertise in React Native and iOS development. Passionate about creating intuitive and performant mobile applications.",
    email: "john.doe@example.com",
    phone: "+62 812-3456-7890",
    skills: ["React Native", "TypeScript", "iOS Development", "Android", "UI/UX Design", "API Integration"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
  };

  const completedProjects: Project[] = [
    {
      id: 1,
      title: "E-commerce Mobile App",
      description: "Developed a full-featured e-commerce mobile application with payment integration",
      completionDate: "Dec 2023",
      clientName: "Tech Store Inc.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
    },
    // Add more projects
  ];

  const portfolio: Portfolio[] = [
    {
      id: 1,
      title: "Food Delivery App",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
      link: "https://example.com/portfolio/1",
    },
    // Add more portfolio items
  ];

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard}>
      <Image source={{ uri: item.image }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectDescription}>{item.description}</Text>
        <Text style={styles.projectMeta}>Client: {item.clientName}</Text>
        <Text style={styles.projectMeta}>Completed: {item.completionDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPortfolioItem = ({ item }: { item: Portfolio }) => (
    <TouchableOpacity style={styles.portfolioCard}>
      <Image source={{ uri: item.image }} style={styles.portfolioImage} />
      <View style={styles.portfolioOverlay}>
        <Text style={styles.portfolioTitle}>{item.title}</Text>
        <ExternalLink size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Freelancer Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <Image source={{ uri: freelancer.image }} style={styles.profileImage} />
          <Text style={styles.name}>{freelancer.name}</Text>
          <Text style={styles.role}>{freelancer.role}</Text>

          <View style={styles.ratingContainer}>
            <Star size={16} color="#FDB022" fill="#FDB022" />
            <Text style={styles.rating}>{freelancer.rating} ({freelancer.totalProjects} projects)</Text>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>{freelancer.location}</Text>
          </View>

          <Text style={styles.hourlyRate}>{freelancer.hourlyRate}/hour</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>{freelancer.about}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color="#6B7280" />
              <Text style={styles.contactText}>{freelancer.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.contactText}>{freelancer.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.contactText}>Joined {freelancer.joinedDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {freelancer.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Projects</Text>
          <FlatList
            data={completedProjects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <FlatList
            data={portfolio}
            renderItem={renderPortfolioItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioContainer}
          />
        </View>

        <TouchableOpacity style={styles.hireButton}>
          <Text style={styles.hireButtonText}>Hire Now</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  profile: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#111827",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  hourlyRate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563EB",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  about: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
  },
  contactInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: "#2563EB",
  },
  projectsContainer: {
    paddingRight: 20,
  },
  projectCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
  },
  projectMeta: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  portfolioContainer: {
    paddingRight: 20,
  },
  portfolioCard: {
    width: 200,
    height: 150,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
  },
  portfolioOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  hireButton: {
    backgroundColor: "#2563EB",
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  hireButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
