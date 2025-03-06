import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, X, MapPin, Clock } from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useUser } from "@/hooks/tanstack/useUser";
import { debounce } from "lodash";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { COLORS } from "@/constant/color";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import SkeletonSearchItem from "./SkeletonSearchItem";
import Loading from "@/components/Loading";

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
  const { data: user, isLoading: userLoading } = useUser();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Tentukan endpoint berdasarkan role user
  const endpoint = user?.role === 'client' ? 'users' : 'projects';
  
  // Gunakan hook useFetch untuk mendapatkan data
  const { data, isLoading, error, refetch } = useFetch<SearchResult[]>({
    endpoint,
    requiresAuth: true,
    enabled: !!user
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

  // Fungsi untuk refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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
          <ImageWithSkeleton 
            source={{ uri: freelancer.profileImage || 'https://via.placeholder.com/80' }} 
            style={styles.resultImage} 
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{freelancer.fullName}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {freelancer.about || 'No description'}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={COLORS.darkGray} />
              <Text style={styles.location}>{freelancer.location || 'Remote'}</Text>
            </View>
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
          <ImageWithSkeleton 
            source={{ uri: project.image && project.image.length > 0 ? project.image[0] : 'https://via.placeholder.com/80' }} 
            style={styles.resultImage} 
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{project.title}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {project.description || 'No description'}
            </Text>
            <Text style={styles.budget}>Rp {project.budget.toLocaleString('id-ID')}</Text>
            <View style={styles.projectInfo}>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={COLORS.darkGray} />
                <Text style={styles.location}>{project.location || 'Remote'}</Text>
              </View>
              <View style={styles.durationContainer}>
                <Clock size={14} color={COLORS.darkGray} />
                <Text style={styles.duration}>{project.duration}</Text>
              </View>
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

  // Fungsi untuk dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Render loading state dengan komponen Loading
  if (userLoading) {
    return <Loading />;
  }

  // Render empty list
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {Array(5).fill(0).map((_, index) => (
            <SkeletonSearchItem 
              key={index} 
              isFreelancer={user?.role === 'client'} 
            />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>
            {error.message || 'An error occurred while loading data. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery 
            ? `No results for "${searchQuery}"` 
            : user?.role === 'client' 
              ? 'No freelancers available' 
              : 'No projects available'
          }
        </Text>
      </View>
    );
  };

  return (
    <View 
      style={[styles.container, { paddingTop: insets.top }]}
      onStartShouldSetResponder={() => {
        dismissKeyboard();
        return false;
      }}
    >
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color={COLORS.gray} strokeWidth={2} />
          <TextInput 
            style={styles.searchInput} 
            placeholder={user?.role === 'client' ? "Search for the best freelancer..." : "Search for interesting projects..."}
            placeholderTextColor={COLORS.gray} 
            value={searchQuery} 
            onChangeText={setSearchQuery}
            autoFocus={false}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          {searchQuery ? `Search results for "${searchQuery}"` : user?.role === 'client' ? "Top Freelancers" : "Latest Projects"}
        </Text>
        
        <FlatList<SearchResult>
          data={filteredResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={dismissKeyboard}
        />
      </View>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  resultContent: {
    flex: 1,
    marginLeft: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 6,
  },
  resultDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.darkGray,
  },
  budget: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  location: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  duration: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  categoryTag: {
    backgroundColor: 'rgba(8, 145, 178, 0.08)',
    borderColor: 'rgba(8, 145, 178, 0.2)',
  },
  openStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  inProgressStatus: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  defaultStatus: {
    backgroundColor: COLORS.inputBackground,
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
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  ratingTagText: {
    color: '#D97706',
  },
  skeletonContainer: {
    paddingTop: 8,
  },
});
