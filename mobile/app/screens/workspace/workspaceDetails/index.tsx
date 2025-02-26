import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Calendar, Clock, CheckCircle2, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

interface Feature {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "planned";
  completedDate?: string;
}

export default function WorkspaceDetails() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params as { projectId: number };

  const project = {
    id: projectId.toString(),
    title: "E-commerce Mobile App",
    description: "A full-featured e-commerce mobile application with payment integration",
    client: "Tech Store Inc.",
    startDate: "Oct 2023",
    dueDate: "Jan 2024",
    status: "in_progress",
    progress: 65,
    features: [
      {
        id: "1",
        title: "User Authentication",
        description: "Implementation of user login, registration, and password reset",
        status: "completed",
        completedDate: "Nov 15, 2023",
      },
      {
        id: "2",
        title: "Product Catalog",
        description: "Display products with filtering and search capabilities",
        status: "in_progress",
      },
      {
        id: "3",
        title: "Shopping Cart",
        description: "Add to cart functionality with quantity management",
        status: "planned",
      },
    ] as Feature[],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "in_progress":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderFeature = (feature: Feature) => (
    <View key={feature.id} style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(feature.status) }]} />
        <Text style={styles.featureTitle}>{feature.title}</Text>
      </View>
      <Text style={styles.featureDescription}>{feature.description}</Text>
      {feature.completedDate && (
        <View style={styles.completedDate}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.dateText}>Completed on {feature.completedDate}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.clientName}>Client: {project.client}</Text>

          <View style={styles.dateContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.dateText}>
              {project.startDate} - {project.dueDate}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{project.progress}% Complete</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Features & Progress</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#2563EB" />
              <Text style={styles.addButtonText}>Add Feature</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>{project.features.map(renderFeature)}</View>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  projectHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#4B5563",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  featureDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
  },
  completedDate: {
    flexDirection: "row",
    alignItems: "center",
  },
});
