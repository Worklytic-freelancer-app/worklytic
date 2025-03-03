import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, X } from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/useUser";
import { debounce } from "lodash";
import { useFetch } from "@/hooks/tanstack/useFetch";

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
  clientId: string;
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
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);

  // Tentukan endpoint berdasarkan role user
  const endpoint = user?.role === 'client' ? 'users' : 'projects';
  
  // Gunakan hook useFetch untuk mendapatkan data
  const { data, isLoading, error, refetch } = useFetch<SearchResult[]>({
    endpoint,
    requiresAuth: true
  });

  // Filter results when search query or data changes
  useEffect(() => {
    if (!data) return;
    
    if (searchQuery.trim() === "") {
      setFilteredResults(data);
      return;
    }
    
    debouncedSearch(searchQuery);
  }, [searchQuery, data]);

  // Fungsi pencarian dengan debounce
  const filterResults = (query: string) => {
    if (!data || !query.trim()) {
      setFilteredResults(data || []);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    if (user?.role === 'client') {
      // Filter freelancers
      const filtered = data.filter((item) => {
        // Type guard untuk memastikan item adalah Freelancer
        if (!('fullName' in item)) return false;
        
        const freelancer = item as Freelancer;
        return (
          freelancer.fullName.toLowerCase().includes(lowerCaseQuery) ||
          (freelancer.about && freelancer.about.toLowerCase().includes(lowerCaseQuery)) ||
          (freelancer.location && freelancer.location.toLowerCase().includes(lowerCaseQuery)) ||
          (freelancer.skills && freelancer.skills.some(skill => 
            skill.toLowerCase().includes(lowerCaseQuery)
          ))
        );
      });
      setFilteredResults(filtered);
    } else {
      // Filter projects
      const filtered = data.filter((item) => {
        // Type guard untuk memastikan item adalah Project
        if (!('title' in item)) return false;
        
        const project = item as Project;
        return (
          project.title.toLowerCase().includes(lowerCaseQuery) ||
          (project.description && project.description.toLowerCase().includes(lowerCaseQuery)) ||
          (project.category && project.category.toLowerCase().includes(lowerCaseQuery)) ||
          (project.location && project.location.toLowerCase().includes(lowerCaseQuery))
        );
      });
      setFilteredResults(filtered);
    }
  };

  const debouncedSearch = useCallback(debounce(filterResults, 300), [data, user]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const isProject = (item: SearchResult): item is Project => {
    return 'title' in item;
  };

  const renderSearchItem = ({ item }: { item: SearchResult }) => {
    if (user?.role === 'client') {
      // Pastikan item adalah Freelancer
      if (!('fullName' in item)) return null;
      
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
              {freelancer.rating > 0 && (
                <View style={[styles.tag, styles.ratingTag]}>
                  <Text style={[styles.tagText, styles.ratingTagText]}>⭐ {freelancer.rating.toFixed(1)}</Text>
                </View>
              )}
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
      // Pastikan item adalah Project
      if (!('title' in item)) return null;
      
      const project = item as Project;
      return (
        <TouchableOpacity 
          style={styles.resultCard} 
          onPress={() => navigation.navigate("ProjectDetails", { projectId: project._id, clientId: project.clientId })}
        >
          <Image 
            source={{ uri: project.image && project.image.length > 0 ? project.image[0] : 'https://via.placeholder.com/80' }} 
            style={styles.resultImage} 
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{project.title}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {project.description || 'Tidak ada deskripsi'}
            </Text>
            <Text style={styles.budget}>Rp {project.budget.toLocaleString('id-ID')}</Text>
            <View style={styles.projectInfo}>
              <Text style={styles.location}>📍 {project.location || 'Remote'}</Text>
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

  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.emptyText}>Memuat data...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{(error as Error).message || "Terjadi kesalahan saat memuat data"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (searchQuery && filteredResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada hasil untuk "{searchQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Tidak ada data tersedia</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#6b7280" />
          <TextInput 
            style={styles.searchInput} 
            placeholder={user?.role === 'client' ? "Cari freelancer..." : "Cari proyek..."}
            placeholderTextColor="#6b7280" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList<SearchResult>
        data={filteredResults}
        renderItem={renderSearchItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        onRefresh={refetch}
        refreshing={isLoading}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingTag: {
    backgroundColor: '#FEF3C7',
  },
  ratingTagText: {
    color: '#D97706',
  },
});
