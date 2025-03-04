import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Zap, Brain, Target, Briefcase, ChevronRight } from "lucide-react-native";

interface AIRecommendation {
  id: number;
  title: string;
  matchPercentage: number;
  budget: string;
  category: string;
  skills: string[];
  image: string;
}

export default function WorklyticAI() {
  const insets = useSafeAreaInsets();

  const recommendations: AIRecommendation[] = [
    {
      id: 1,
      title: "Mobile App Development",
      matchPercentage: 95,
      budget: "Rp 37.500.000",
      category: "Development",
      skills: ["React Native", "TypeScript", "API Integration"],
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "E-commerce Website",
      matchPercentage: 88,
      budget: "Rp 45.000.000",
      category: "Web Development",
      skills: ["React", "Node.js", "MongoDB"],
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Match</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#e0f2fe" }]}>
              <Target size={24} color="#0284c7" />
            </View>
            <Text style={styles.statValue}>95%</Text>
            <Text style={styles.statLabel}>Match Rate</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
              <Briefcase size={24} color="#d97706" />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Matches</Text>
          {recommendations.map((item) => (
            <TouchableOpacity key={item.id} style={styles.matchCard}>
              <Image source={{ uri: item.image }} style={styles.projectImage} />
              <View style={styles.matchInfo}>
                <View style={styles.matchHeader}>
                  <Text style={styles.matchTitle}>{item.title}</Text>
                  <View style={styles.matchBadge}>
                    <Zap size={14} color="#d97706" />
                    <Text style={styles.matchPercentage}>{item.matchPercentage}% Match</Text>
                  </View>
                </View>
                <Text style={styles.matchCategory}>{item.category}</Text>
                <Text style={styles.matchBudget}>{item.budget}</Text>
                <View style={styles.skillsContainer}>
                  {item.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.aiFeatures}>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Target size={24} color="#2563eb" />
            </View>
            <Text style={styles.featureTitle}>Skill Analysis</Text>
            <Text style={styles.featureDescription}>Get insights about your skills and improvement areas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Brain size={24} color="#2563eb" />
            </View>
            <Text style={styles.featureTitle}>Smart Suggestions</Text>
            <Text style={styles.featureDescription}>Receive personalized project recommendations</Text>
          </TouchableOpacity>
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
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  matchCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  projectImage: {
    width: 100,
    height: "100%",
  },
  matchInfo: {
    flex: 1,
    padding: 16,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  matchTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchPercentage: {
    fontSize: 12,
    fontWeight: "500",
    color: "#d97706",
  },
  matchCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  matchBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: "#4b5563",
  },
  aiFeatures: {
    padding: 20,
    flexDirection: "row",
    gap: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});
