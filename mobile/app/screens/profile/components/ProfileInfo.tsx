import { View, Text, Image, StyleSheet } from "react-native";
import { MapPin, Star } from "lucide-react-native";

interface ProfileInfoProps {
  fullName: string;
  location: string;
  profileImage: string;
  rating: number;
  totalReviews: number;
}

export default function ProfileInfo({ 
  fullName, 
  location, 
  profileImage, 
  rating, 
  totalReviews 
}: ProfileInfoProps) {
  return (
    
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profileImage }}
          style={styles.profileImage}
        />
        <View style={styles.onlineIndicator} />
      </View>
      <Text style={styles.name}>{fullName}</Text>
      {location && (
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.location}>{location}</Text>
      </View>
      )}
      <View style={styles.ratingContainer}>
        <Star size={16} color="#fbbf24" fill="#fbbf24" />
        <Text style={styles.rating}>{rating?.toFixed(1)} ({totalReviews} reviews)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 