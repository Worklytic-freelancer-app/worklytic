import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, MapPin, Star, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  const services = [
    {
      id: 1,
      title: "Mobile App Development",
      description: "Create custom mobile applications for iOS and Android",
      price: "Rp5.000.000",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Web Development",
      description: "Build responsive and modern web applications",
      price: "Rp4.000.000",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&auto=format&fit=crop&q=60",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
              <Settings size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.name}>John Doe</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.location}>Jakarta, Indonesia</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.rating}>4.8 (25 reviews)</Text>
            </View>
          </View>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIconContainer}>
                <Text style={styles.balanceIcon}>S</Text>
              </View>
              <View style={styles.balanceTextContainer}>
                <Text style={styles.balanceLabel}>Worklytic Balance</Text>
                <Text style={styles.balanceAmount}>Rp0</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>$2.5k</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>Experienced freelance developer specializing in mobile and web applications. Passionate about creating clean, efficient, and user-friendly solutions.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {["React Native", "JavaScript", "TypeScript", "UI/UX Design", "Node.js", "MongoDB"].map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Services</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddService")}>
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesContainer}
            >
              {services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <Image 
                    source={{ uri: service.image }} 
                    style={styles.serviceImage}
                  />
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 12,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "#2563eb",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    borderWidth: 4,
    borderColor: "#fff",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  location: {
    marginLeft: 6,
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  rating: {
    marginLeft: 6,
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#f3f4f6",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
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
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "500",
  },
  balanceContainer: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 24,
    padding: 20,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  balanceIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: 280,
    marginLeft: 12,
  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
});
