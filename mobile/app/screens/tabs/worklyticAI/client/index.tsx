import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Zap, Brain, Target, Briefcase, ChevronRight } from "lucide-react-native";
import { useState, useEffect } from "react";
import { SecureStoreUtils } from "../../../../utils/SecureStore";
import { baseUrl } from "../../../../constant/baseUrl";
import { COLORS } from "../../../../constant/color";

interface ServiceRecommendation {
  serviceId: string;
  title: string;
  matchPercentage: number;  
  budget: number;
  category: string;
  include: string[];
  image: string[];
}

export default function WorklyticAIClient() {
  const insets = useSafeAreaInsets();
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const userData = await SecureStoreUtils.getUserData();
      // console.log(userData, "userData");

      const token = await SecureStoreUtils.getToken();
      
      const response = await fetch(`${baseUrl}/api/services/aiRecommendations`, {
        headers: {
          'user': JSON.stringify(userData),
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log(data, "data");
      
      setRecommendations(data.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Match</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(8, 145, 178, 0.08)" }]}>
              <Target size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>
              {recommendations.length > 0 
                ? `${Math.round(recommendations.map((item) => item.matchPercentage).reduce((a, b) => a + b, 0) / recommendations.length)}%`
                : '0%'
              }
            </Text>
            <Text style={styles.statLabel}>Match Rate</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(249, 115, 22, 0.08)" }]}>
              <Briefcase size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{recommendations.length}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Matches</Text>
          {recommendations?.map((item) => (
            <TouchableOpacity key={item.serviceId} style={styles.matchCard}>
              <Image 
                source={{ uri: item.image[0] }} 
                style={styles.projectImage} 
              />
              <View style={styles.matchInfo}>
                <View style={styles.matchHeader}>
                  <Text style={styles.matchTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.matchBadge}>
                    <Zap size={14} color={COLORS.secondary} />
                    <Text style={styles.matchPercentage}>{item.matchPercentage}% Match</Text>
                  </View>
                </View>
                <Text style={styles.matchCategory}>{item.category}</Text>
                <Text style={styles.matchBudget}>{formatBudget(item.budget)}</Text>
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillLabel}>Include:</Text>
                  {item.include.map((include, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{include}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <ChevronRight size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.aiFeatures}>
          <TouchableOpacity style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(8, 145, 178, 0.08)" }]}>
              <Target size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>Skill Analysis</Text>
            <Text style={styles.featureDescription}>Get insights about your skills and improvement areas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: "rgba(8, 145, 178, 0.08)" }]}>
              <Brain size={24} color={COLORS.primary} />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
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
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  matchCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.black,
    marginRight: 8,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  matchPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  matchCategory: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
    fontWeight: "500",
  },
  matchBudget: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.success,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  skillBadge: {
    backgroundColor: "rgba(8, 145, 178, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  aiFeatures: {
    padding: 20,
    flexDirection: "row",
    gap: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 18,
    fontWeight: "500",
  },
  skillLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "500",
  },
});
