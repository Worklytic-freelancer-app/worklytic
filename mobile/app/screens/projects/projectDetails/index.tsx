import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator, RefreshControl, Share, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Clock, DollarSign, MapPin, MessageCircle, Share as ShareIcon, Heart, Calendar, Award, Briefcase, ImageIcon } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useState, useRef } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import ProjectDiscussion from "./projectDiscussion";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";

interface ProjectDetails {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  completedDate: string;
  status: string;
  requirements: string[];
  image: string[];
  assignedFreelancer: any[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

type ProjectDetailsRouteProp = RouteProp<RootStackParamList, 'ProjectDetails'>;

export default function ProjectDetails() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProjectDetailsRouteProp>();
  const [showTerms, setShowTerms] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { data: user } = useUser();

  // Menggunakan useFetch untuk mendapatkan detail project
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError,
    refetch: refetchProject
  } = useFetch<ProjectDetails>({
    endpoint: `projects/${route.params.projectId}`,
    requiresAuth: true
  });

  // Menggunakan useFetch untuk mendapatkan detail client
  const { 
    data: client, 
    isLoading: clientLoading, 
    error: clientError,
    refetch: refetchClient
  } = useFetch<any>({
    endpoint: `users/${route.params.clientId}`,
    requiresAuth: true
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [250, 300],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  const handleMainScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  // Gabungkan status loading dan error
  const isLoading = projectLoading || clientLoading;
  const error = projectError || clientError;

  // Cek apakah user adalah client atau pemilik project
  const isClientOrOwner = user?.role === 'client' || project?.clientId === user?._id;

  // Fungsi untuk menghitung durasi proyek
  const calculateDuration = (completedDate: string): string => {
    const now = new Date();
    const targetDate = new Date(completedDate);
    
    // Jika tanggal sudah lewat, kembalikan "Expired"
    if (targetDate < now) {
      return "Expired";
    }
    
    // Hitung selisih dalam hari
    const diffTime = Math.abs(targetDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} hari`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} tahun ${remainingMonths} bulan` : `${years} tahun`;
    }
  };

  // Fungsi untuk memformat budget dengan lebih baik
  const formatBudget = (amount: number): string => {
    if (amount >= 1000000000) {
      return `Rp${(amount / 1000000000).toFixed(1)} Miliar`;
    } else if (amount >= 1000000) {
      return `Rp${(amount / 1000000).toFixed(1)} Juta`;
    } else if (amount >= 1000) {
      return `Rp${(amount / 1000).toFixed(1)} Ribu`;
    } else {
      return `Rp${amount.toLocaleString('id-ID')}`;
    }
  };

  // Format tanggal untuk tampilan yang lebih baik
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetchProject();
    await refetchClient();
    setRefreshing(false);
  }, [refetchProject, refetchClient]);

  // Fungsi untuk berbagi proyek
  const handleShare = async () => {
    if (!project) return;
    
    try {
      await Share.share({
        title: project.title,
        message: `Check out this project: ${project.title}\n\nBudget: ${formatBudget(project.budget)}\nLocation: ${project.location}\n\nDescription: ${project.description.substring(0, 100)}...`,
        url: `https://worklytic.com/projects/${project._id}`,
      });
    } catch (error) {
      console.error("Error sharing project:", error);
    }
  };
  
  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Implementasi penyimpanan favorit bisa ditambahkan di sini
  };

  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open':
            return {
                bg: `${COLORS.primary}20`,
                text: COLORS.primary
            };
        case 'in progress':
            return {
                bg: `${COLORS.info}20`,
                text: COLORS.info
            };
        case 'completed':
            return {
                bg: `${COLORS.success}20`,
                text: COLORS.success
            };
        case 'closed':
            return {
                bg: `${COLORS.gray}20`,
                text: COLORS.gray
            };
        default:
            return {
                bg: `${COLORS.gray}20`,
                text: COLORS.gray
            };
    }
  };

  // Handle error jika ada
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data"}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            refetchProject();
            refetchClient();
          }}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle loading state
  if (isLoading || !project) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Sederhana */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Proyek</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <ShareIcon size={22} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          // Tambahkan padding bottom jika bukan client/owner untuk memberikan ruang untuk footer
          !isClientOrOwner && { paddingBottom: 80 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Image Carousel tanpa status badge */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {project.image && project.image.length > 0 ? (
              project.image.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={styles.carouselImage}>
                <View style={styles.noImageContainer}>
                  <ImageIcon size={60} color={COLORS.lightGray} />
                  <Text style={styles.noImageText}>No Image Available</Text>
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Pagination dots */}
          {project.image && project.image.length > 1 && (
            <View style={styles.paginationContainer}>
              {project.image.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeSlide && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Project Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{project.category}</Text>
            </View>
            
            {/* Status dipindahkan ke sini */}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(project.status).bg }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor(project.status).text }
                ]}>
                  {project.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid - Perbaikan styling */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statsCard}>
                <View style={[styles.statsIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
                  <DollarSign size={20} color={COLORS.primary} />
                </View>
                <View style={styles.statsContent}>
                  <Text style={styles.statsLabel}>Budget</Text>
                  <Text style={styles.statsValue}>{formatBudget(project.budget)}</Text>
                </View>
              </View>
              
              <View style={styles.statsCard}>
                <View style={[styles.statsIconContainer, { backgroundColor: `${COLORS.info}15` }]}>
                  <Clock size={20} color={COLORS.info} />
                </View>
                <View style={styles.statsContent}>
                  <Text style={styles.statsLabel}>Duration</Text>
                  <Text style={styles.statsValue}>{calculateDuration(project.completedDate)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statsCard}>
                <View style={[styles.statsIconContainer, { backgroundColor: `${COLORS.secondary}15` }]}>
                  <Calendar size={20} color={COLORS.secondary} />
                </View>
                <View style={styles.statsContent}>
                  <Text style={styles.statsLabel}>Deadline</Text>
                  <Text style={styles.statsValue}>{formatDate(project.completedDate)}</Text>
                </View>
              </View>
              
              <View style={styles.statsCard}>
                <View style={[styles.statsIconContainer, { backgroundColor: `${COLORS.success}15` }]}>
                  <MapPin size={20} color={COLORS.success} />
                </View>
                <View style={styles.statsContent}>
                  <Text style={styles.statsLabel}>Location</Text>
                  <Text style={styles.statsValue}>{project.location}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {project.description}
            </Text>
          </View>

          {/* Requirements */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.requirementsList}>
              {project.requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.requirementBullet}>
                    <Award size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Client Info */}
          {client && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Posted by</Text>
              <View style={styles.clientCard}>
                <Image 
                  source={{ uri: client.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(client.fullName) }} 
                  style={styles.clientImage} 
                />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.fullName}</Text>
                  <Text style={styles.clientLocation}>
                    <MapPin size={14} color={COLORS.gray} style={styles.locationIcon} />
                    {project.location}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Extra space for footer */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Tampilkan footer dengan tombol aksi hanya jika user bukan client atau pemilik project */}
      {!isClientOrOwner && (
        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity style={styles.chatButton}>
            <MessageCircle size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => navigation.navigate('Payment', { projectId: project._id })}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <ProjectDiscussion
        isVisible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setShowTerms(false);
          navigation.navigate('Payment', { projectId: project._id });
        }}
        projectId={route.params.projectId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  carouselContainer: {
    width: Dimensions.get("window").width,
    height: 300,
    position: "relative",
  },
  carouselImage: {
    width: Dimensions.get("window").width,
    height: 300,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
  },
  paginationDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
    marginLeft: 4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkGray,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requirementBullet: {
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.darkGray,
    flex: 1,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  clientLocation: {
    fontSize: 14,
    color: COLORS.gray,
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  applyButton: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.black,
  },
  infoContainer: {
    padding: 20,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});
