import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Clock, DollarSign, MapPin, MessageCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import ProjectDiscussion from "./projectDiscussion";

interface ProjectDetails {
  id: number;
  title: string;
  budget: string;
  category: string;
  location: string;
  duration: string;
  postedBy: {
    id: number;
    name: string;
    image: string;
    rating: number;
  };
  description: string;
  requirements: string[];
  image: string;
}

type ProjectDetailsNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProjectDetails() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProjectDetailsNavigationProp>();
  const [showTerms, setShowTerms] = useState(false);
  const windowWidth = Dimensions.get("window").width;

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

  const project: ProjectDetails = {
    id: 1,
    title: "Mobile App Development",
    budget: "Rp 37.500.000",
    category: "Development",
    location: "Remote",
    duration: "3 months",
    postedBy: {
      id: 1,
      name: "Tech Solutions Inc.",
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
      rating: 4.8,
    },
    description:
      "Looking for an experienced mobile developer to create a modern, user-friendly application. The project involves building both iOS and Android versions using React Native. The app will include features such as user authentication, real-time messaging, and integration with REST APIs.",
    requirements: ["5+ years of mobile development experience", "Strong knowledge of React Native", "Experience with REST APIs", "Good understanding of UI/UX principles", "Excellent communication skills"],
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
  };

  // Mock images for the carousel
  const projectImages = [
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&auto=format&fit=crop&q=60",
  ];

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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} onScroll={handleMainScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.carouselContainer}>
          <ScrollView ref={scrollViewRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={handleScroll}>
            {projectImages.map((image, index) => (
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
            {projectImages.map((_, index) => (
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
                <Text style={styles.statValue}>{project.budget}</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <View style={styles.posterContainer}>
              <Image source={{ uri: project.postedBy.image }} style={styles.posterImage} />
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>{project.postedBy.name}</Text>
                <Text style={styles.posterRating}>⭐️ {project.postedBy.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate("DirectMessage", {
              userId: project.postedBy.id,
              userName: project.postedBy.name,
              userImage: project.postedBy.image,
            })
          }
        >
          <MessageCircle size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={() => setShowTerms(true)}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>

      {/* Add the ProjectDiscussion component */}
      <ProjectDiscussion
        isVisible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setShowTerms(false);
          // Handle acceptance logic here
        }}
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
  posterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  posterImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  posterRating: {
    fontSize: 14,
    color: "#6b7280",
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
});
