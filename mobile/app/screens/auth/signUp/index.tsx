import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, UserCircle2, Building2 } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import SignUpForm from "./SignUpForm";

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type SignUpScreenProps = {
  route?: {
    params?: {
      role?: "freelancer" | "client";
    };
  };
};

export default function SignUp({ route }: SignUpScreenProps) {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const role = route?.params?.role;

  if (role) {
    return <SignUpForm role={role} />;
  }

  const handleRoleSelection = (selectedRole: "freelancer" | "client") => {
    navigation.navigate("SignUp", { role: selectedRole });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Pilih Role Anda di Worklytic</Text>

      {/* Freelancer Choice */}
      <TouchableOpacity style={styles.choiceCard} onPress={() => handleRoleSelection("freelancer")}>
        <View style={styles.iconContainer}>
          <UserCircle2 size={32} color="#2563EB" />
        </View>
        <View style={styles.choiceTextContainer}>
          <Text style={styles.choiceTitle}>Saya Freelancer</Text>
          <Text style={styles.choiceDescription}>Tambah Penghasilan melalui Kesempatan Bekerja dengan 40,000+ client</Text>
        </View>
      </TouchableOpacity>

      {/* Client Choice */}
      <TouchableOpacity style={styles.choiceCard} onPress={() => handleRoleSelection("client")}>
        <View style={styles.iconContainer}>
          <Building2 size={32} color="#2563EB" />
        </View>
        <View style={styles.choiceTextContainer}>
          <Text style={styles.choiceTitle}>Saya Client</Text>
          <Text style={styles.choiceDescription}>Rekrut Freelancer Profesional Terkurasi untuk Hasil Pekerjaan Terbaik</Text>
        </View>
      </TouchableOpacity>

      {/* Footer remains the same */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6FF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 30,
    color: "#000",
  },
  choiceCard: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  choiceDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  loginLink: {
    color: "#2563EB",
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#2563EB",
  },
});
