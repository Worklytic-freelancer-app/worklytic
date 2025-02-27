import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star, Clock, MessageCircle } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ServiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ServiceDetails() {
  const navigation = useNavigation<ServiceDetailScreenNavigationProp>();
  const route = useRoute();

  // Mock data - replace with actual data fetching
  const service = {
    id: 1,
    title: "Mobile App Development",
    description: "Professional mobile app development service for iOS and Android platforms. I specialize in creating high-quality, user-friendly applications using React Native and other modern technologies.",
    price: "Rp5.000.000",
    deliveryTime: "14 days",
    rating: 4.8,
    reviews: 25,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    freelancer: {
      id: 1,
      name: "John Doe",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      role: "Senior Mobile Developer",
      completedProjects: 45,
    },
    includes: ["Native app development", "UI/UX design", "API integration", "Testing and debugging", "App store submission"],
    requirements: ["Project requirements document", "Brand assets and guidelines", "API documentation (if available)"],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <Image source={{ uri: service.image }} style={styles.coverImage} />

        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.freelancerSection}
            onPress={() => navigation.navigate("FreelancerDetails", { 
              freelancerId: service.freelancer.id 
            })}
          >
            <Image source={{ uri: service.freelancer.image }} style={styles.freelancerImage} />
            <View style={styles.freelancerInfo}>
              <Text style={styles.freelancerName}>{service.freelancer.name}</Text>
              <Text style={styles.freelancerRole}>{service.freelancer.role}</Text>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() =>
                navigation.navigate("DirectMessage", {
                  userId: service.freelancer.id,
                  userName: service.freelancer.name,
                  userImage: service.freelancer.image,
                })
              }
            >
              <MessageCircle size={20} color="#ffffff" />
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.title}>{service.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statText}>
                {service.rating} ({service.reviews} reviews)
              </Text>
            </View>
            <View style={styles.stat}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.statText}>{service.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {service.includes.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {service.requirements.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listDot}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>{service.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.hireMeButton}
          onPress={() => {
            // Handle hire action
          }}
        >
          <Text style={styles.hireMeButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  coverImage: {
    width: "100%",
    height: 240,
  },
  content: {
    padding: 20,
  },
  freelancerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  freelancerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  freelancerInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  freelancerRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  chatButton: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6b7280",
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
    lineHeight: 24,
    color: "#4b5563",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  listDot: {
    fontSize: 16,
    color: "#6b7280",
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: "#4b5563",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  hireMeButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  hireMeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
