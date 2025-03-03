import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ReviewPostProjectRouteProp = RouteProp<RootStackParamList, 'ReviewPostProject'>;

export default function ReviewPostProject() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReviewPostProjectRouteProp>();
  const projectData = route.params;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Project</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <ScrollView horizontal style={styles.imageContainer} showsHorizontalScrollIndicator={false}>
          {projectData.images.map((uri: string, index: number) => (
            <Image key={index} source={{ uri }} style={styles.projectImage} />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{projectData.title}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{projectData.category}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Budget</Text>
            <Text style={styles.value}>Rp {projectData.budget}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{projectData.duration}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{projectData.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{projectData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.description}>{projectData.requirements}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.paymentButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    marginBottom: 24,
  },
  projectImage: {
    width: 280,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});