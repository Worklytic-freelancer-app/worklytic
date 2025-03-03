import { View, Text, Image, StyleSheet } from "react-native";
import { MapPin, Star } from "lucide-react-native";
import { COLORS } from "@/constant/color";

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
          <MapPin size={16} color={COLORS.gray} />
          <Text style={styles.location}>{location}</Text>
      </View>
      )}
      <View style={styles.ratingContainer}>
        <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
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
    borderColor: COLORS.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  location: {
    marginLeft: 6,
    color: COLORS.darkGray,
    fontSize: 15,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  rating: {
    marginLeft: 6,
    color: COLORS.darkGray,
    fontSize: 15,
    fontWeight: "500",
  },
}); 