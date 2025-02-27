import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, User, Bell, Lock, HelpCircle, LogOut } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Settings() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const settingsOptions = [
    { icon: User, title: "Edit Profile", subtitle: "Change your profile information" },
    { icon: Bell, title: "Notifications", subtitle: "Manage your notifications" },
    { icon: Lock, title: "Privacy & Security", subtitle: "Control your privacy settings" },
    { icon: HelpCircle, title: "Help & Support", subtitle: "Get help or contact support" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <option.icon size={22} color="#4b5563" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
            <ChevronLeft size={20} color="#9ca3af" style={{ transform: [{ rotate: "180deg" }] }} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.settingItem, styles.logoutButton]} onPress={() => navigation.navigate("SignIn")}>
          <View style={[styles.settingIcon, { backgroundColor: "#fee2e2" }]}>
            <LogOut size={22} color="#ef4444" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: "#ef4444" }]}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    marginTop: 24,
  },
});
