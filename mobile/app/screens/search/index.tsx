import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, ArrowLeft, Star } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/useUser";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

// Update interfaces
interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  duration: string;
  status: string;
  requirements: string[];
  image: string[];
  features: string[];
  progress: number;
}

interface Freelancer {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage: string;
  location: string;
  about: string;
  skills: string[];
  rating: number;
  totalReviews: number;
  website: string;
}

type SearchResult = Project | Freelancer;

export default function Search(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const token = await SecureStoreUtils.getToken();
      
      // Ubah logika endpoint - jika freelancer, cari projects
      // jika client, cari freelancers
      const endpoint = user?.role === 'client' ? 'users?role=freelancer' : 'projects';
      
      const response = await fetch(`${baseUrl}/api/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const isProject = (item: SearchResult): item is Project => {
    return 'budget' in item;
  };

  const renderSearchItem = ({ item }: { item: SearchResult }) => {
    if (user?.role === 'client') {
      const freelancer = item as Freelancer;
      return (
        <TouchableOpacity 
          style={styles.resultCard} 
          onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: freelancer._id })}
        >
          <Image 
            source={{ uri: freelancer.profileImage || 'https://via.placeholder.com/80' }} 
            style={styles.resultImage} 
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{freelancer.fullName}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {freelancer.about || 'Tidak ada deskripsi'}
            </Text>
            <Text style={styles.location}>📍 {freelancer.location || 'Remote'}</Text>
            <View style={styles.tagsContainer}>
              {(freelancer.skills || []).slice(0, 2).map((skill, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      const project = item as Project;
      return (
        <TouchableOpacity 
          style={styles.resultCard} 
          onPress={() => navigation.navigate("ProjectDetails", { projectId: project._id })}
        >
          <Image 
            source={{ uri: project.image?.[0] || 'https://via.placeholder.com/80' }} 
            style={styles.resultImage} 
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{project.title}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {project.description}
            </Text>
            <View style={styles.projectInfo}>
              <Text style={styles.budget}>
                Rp{project.budget?.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.duration}>⏱️ {project.duration}</Text>
            </View>
            <View style={styles.tagsContainer}>
              <View style={[styles.tag, styles.categoryTag]}>
                <Text style={styles.tagText}>{project.category}</Text>
              </View>
              <View style={[styles.tag, getStatusStyle(project.status)]}>
                <Text style={styles.tagText}>{project.status}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open':
        return styles.openStatus;
      case 'In Progress':
        return styles.inProgressStatus;
      default:
        return styles.defaultStatus;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#6b7280" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search" 
            placeholderTextColor="#6b7280" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            autoFocus 
          />
        </View>
      </View>

      <FlatList<SearchResult>
        data={searchResults}
        renderItem={renderSearchItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
  },
  budget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 4,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryTag: {
    backgroundColor: '#EEF2FF',
  },
  openStatus: {
    backgroundColor: '#DCFCE7',
  },
  inProgressStatus: {
    backgroundColor: '#FEF3C7',
  },
  defaultStatus: {
    backgroundColor: '#F3F4F6',
  },
});
