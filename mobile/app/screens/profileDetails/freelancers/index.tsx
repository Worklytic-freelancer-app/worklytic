import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Star, MapPin, Filter, ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

interface Freelancer {
  id: string;
  name: string;
  role: string;
  rating: number;
  hourlyRate: string;
  location: string;
  skills: string[];
  image: string;
}

type FreelancersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Freelancers() {
  const navigation = useNavigation<FreelancersScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const freelancers: Freelancer[] = [
    {
      id: "1",
      name: "John Doe",
      role: "Mobile Developer",
      rating: 4.8,
      hourlyRate: "Rp 500.000",
      location: "Jakarta, Indonesia",
      skills: ["React Native", "TypeScript", "UI/UX"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "UI/UX Designer",
      rating: 4.9,
      hourlyRate: "Rp 450.000",
      location: "Bandung, Indonesia",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60",
    },
    // Add more freelancers as needed
  ];

  const renderFreelancer = ({ item }: { item: Freelancer }) => (
    <TouchableOpacity 
      style={styles.freelancerCard}
      onPress={() => navigation.navigate("FreelancerDetails", { freelancerId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.freelancerImage} />
      <View style={styles.freelancerInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FDB022" fill="#FDB022" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.location}>{item.location}</Text>
        </View>

        <Text style={styles.hourlyRate}>{item.hourlyRate}/hour</Text>

        <View style={styles.skillsContainer}>
          {item.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Freelancers</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search freelancers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={freelancers}
        renderItem={renderFreelancer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  freelancerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  freelancerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  freelancerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#111827",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: "#2563EB",
  },
});
