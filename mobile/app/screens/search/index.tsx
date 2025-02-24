import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon, ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

interface SearchResult {
  id: number;
  type: "project" | "freelancer";
  title?: string;
  name?: string;
  description: string;
  image: string;
  tags: string[];
}

export default function Search(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults: SearchResult[] = [
    {
      id: 1,
      type: "project",
      title: "Mobile App Development",
      description: "Looking for experienced mobile developer",
      image: "https://picsum.photos/200?random=1",
      tags: ["React Native", "Mobile", "Development"],
    },
    {
      id: 2,
      type: "freelancer",
      name: "Sarah Chen",
      description: "UI/UX Designer with 5 years experience",
      image: "https://picsum.photos/200?random=2",
      tags: ["UI/UX", "Figma", "Design"],
    },
  ];

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultCard}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>
          {item.type === "project" ? item.title : item.name}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
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
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects or freelancers"
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id.toString()}
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
});
