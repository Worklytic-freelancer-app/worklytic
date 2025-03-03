import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Clock, DollarSign, MapPin, MessageCircle } from "lucide-react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useState, useRef } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import ProjectDiscussion from "./projectDiscussion";
import { useFetch } from "@/hooks/tanstack/useFetch";

interface ProjectDetails {
  _id: string;
  clientId: string;
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
    inputRange: [250, 300],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [250, 300],
    outputRange: [0, 0],
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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <View
          style={[
            styles.headerContent,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {project.title}
          </Text>
        </View>
      </Animated.View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        onScroll={handleMainScroll} 
        scrollEventThrottle={16} 
        contentContainerStyle={{ paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetchProject();
              refetchClient();
            }}
          />
        }
      >
        <View style={styles.carouselContainer}>
          <ScrollView ref={scrollViewRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={handleScroll}>
            {project.image.map((image, index) => (
              <View key={index} style={styles.carouselItemContainer}>
                <Image source={{ uri: image }} style={styles.carouselImage} />
              </View>
            ))}
          </ScrollView>

          {/* Carousel Back Button */}
          <TouchableOpacity style={[styles.carouselBackButton, { marginTop: insets.top }]} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.paginationContainer}>
            {project.image.map((_, index) => (
              <View key={index} style={[styles.paginationDot, index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive]} />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{project.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#e0f2fe" }]}>
                <DollarSign size={20} color="#0284c7" />
              </View>
              <View>
                <Text style={styles.statLabel}>Budget</Text>
                <Text style={styles.statValue}>Rp{project.budget.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
                <Clock size={20} color="#d97706" />
              </View>
              <View>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{project.duration}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {project.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>

          {project.features && project.features.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {project.features.map((feature, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.requirementText}>
                    {typeof feature === 'string' ? feature : JSON.stringify(feature)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Owner</Text>
            {client && (
              <View style={styles.clientInfo}>
                <Image 
                  source={{ uri: client.profileImage }} 
                  style={styles.clientImage} 
                />
                <View>
                  <Text style={styles.clientName}>{client.fullName}</Text>
                  <Text style={styles.clientLocation}>{project.location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => console.log("Chat Button Pressed")}
        >
          <MessageCircle size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => setShowTerms(true)}
        >
          <Text style={styles.applyButtonText}>
            Apply Now
          </Text>
        </TouchableOpacity>
      </View>

      <ProjectDiscussion
        isVisible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setShowTerms(false);
          navigation.navigate('BottomTab', { screen: 'Workspace' });
          alert('Aplikasi berhasil dikirim! Tunggu konfirmasi dari client.');
        }}
        projectId={route.params.projectId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  animatedHeader: {
    position: "absolute",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    height: 100,
    backgroundColor: "#fff",
  },
  headerBackButton: {
    width: 22,
    height: 22,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 16,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  carouselContainer: {
    height: 300,
    backgroundColor: "#f3f4f6",
    position: "relative",
    marginTop: 0,
  },
  carouselBackButton: {
    position: "absolute",
    top: 10,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  carouselItemContainer: {
    width: Dimensions.get("window").width,
    height: 300,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#2563eb",
  },
  paginationDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
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
    color: "#4b5563",
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: "#4b5563",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  clientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clientLocation: {
    fontSize: 14,
    color: '#6b7280',
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
});
