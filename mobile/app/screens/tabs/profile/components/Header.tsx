import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Settings } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Header() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
        <Settings size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 12,
  },
}); 