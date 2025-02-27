import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Mail, Phone, Calendar, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

interface Project {
  id: number;
  title: string;
  description: string;
  completionDate: string;
  clientName: string;
  image: string;
  category: string;
  budget: string;
  duration: string;
  status: string;
}

// First, add the Service interface near the top with other interfaces
interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

type FreelancerDetailsNavigationProp = StackNavigationProp<RootStackParamList>;

export default function FreelancerDetails() {
  const navigation = useNavigation<FreelancerDetailsNavigationProp>();
  const insets = useSafeAreaInsets();
  
  const freelancer = {
    id: 1,
    name: "John Doe",
    role: "Senior Mobile Developer",
    totalProjects: 47,
    successRate: "95%",
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
      category: "Mobile Development",
      budget: "Rp 75.000.000",
      duration: "3 months",
      status: "Completed",
    },
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

  // Add services data
  const services: Service[] = [
    {
      id: 1,
      title: "Mobile App Development",
      description: "Full-stack mobile app development with React Native",
      price: "Rp5.000.000",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
      category: "Development",
    },
    {
      id: 2,
      title: "UI/UX Design",
      description: "Modern and intuitive mobile app design",
      price: "Rp3.000.000",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
      category: "Design",
    },
  ];

  // Add render function for services
  const renderService = (service: Service) => (
    <TouchableOpacity 
      key={service.id}
      style={styles.serviceCard}
      onPress={() => navigation.navigate("ServiceDetails", { serviceId: service.id })}
    >
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <Text style={styles.servicePrice}>{service.price}</Text>
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

          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>{freelancer.location}</Text>
          </View>
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
          <Text style={styles.sectionTitle}>Services</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {services.map(renderService)}
          </ScrollView>
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

        <TouchableOpacity style={[styles.hireButton, { backgroundColor: "#10B981" }]}>
          <Text style={styles.hireButtonText}>Chat</Text>
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
  hireButton: {
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
  servicesContainer: {
    paddingRight: 20,
  },
  serviceCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceInfo: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});
