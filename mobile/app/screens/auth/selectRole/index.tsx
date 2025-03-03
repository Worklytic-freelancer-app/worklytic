import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, UserCircle2, Building2 } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constant/color";

type SelectRoleScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SelectRole() {
  const navigation = useNavigation<SelectRoleScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "client" | null>(null);

  // Animation values
  const [freelancerScale] = useState(new RNAnimated.Value(1));
  const [clientScale] = useState(new RNAnimated.Value(1));

  const handleRoleSelection = (selected: "freelancer" | "client") => {
    setSelectedRole(selected);

    // Animate the selected card
    const scaleValue = selected === "freelancer" ? freelancerScale : clientScale;

    RNAnimated.sequence([
      RNAnimated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(scaleValue, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to the SignUp screen with role parameter
      navigation.navigate("SignUp", { role: selected });
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.black} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Pilih Role Anda</Text>
        <Text style={styles.subtitle}>Pilih peran Anda di Worklytic</Text>
      </View>

      {/* Freelancer Choice */}
      <RNAnimated.View style={{ transform: [{ scale: freelancerScale }] }}>
        <TouchableOpacity style={[styles.choiceCard, selectedRole === "freelancer" && styles.selectedCard]} onPress={() => handleRoleSelection("freelancer")} disabled={selectedRole !== null}>
          <View style={styles.iconContainer}>
            <UserCircle2 size={32} color={COLORS.primary} />
          </View>
          <View style={styles.choiceTextContainer}>
            <Text style={styles.choiceTitle}>Saya Freelancer</Text>
            <Text style={styles.choiceDescription}>Tambah Penghasilan melalui Kesempatan Bekerja dengan 40,000+ client</Text>
          </View>
        </TouchableOpacity>
      </RNAnimated.View>

      {/* Client Choice */}
      <RNAnimated.View style={{ transform: [{ scale: clientScale }] }}>
        <TouchableOpacity style={[styles.choiceCard, selectedRole === "client" && styles.selectedCard]} onPress={() => handleRoleSelection("client")} disabled={selectedRole !== null}>
          <View style={styles.iconContainer}>
            <Building2 size={32} color={COLORS.primary} />
          </View>
          <View style={styles.choiceTextContainer}>
            <Text style={styles.choiceTitle}>Saya Client</Text>
            <Text style={styles.choiceDescription}>Rekrut Freelancer Profesional Terkurasi untuk Hasil Pekerjaan Terbaik</Text>
          </View>
        </TouchableOpacity>
      </RNAnimated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sudah memiliki akun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  choiceCard: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.inputBackground,
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.black,
  },
  choiceDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
});
