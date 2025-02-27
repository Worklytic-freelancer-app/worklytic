
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { baseUrl } from "@/constant/baseUrl";
import { Alert } from "react-native";
import { SecureStoreUtils } from "@/utils/SecureStore";

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface SignUpFormProps {
  role: "client" | "freelancer";
}

export default function SignUpForm({ role }: SignUpFormProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: role,
  });

  async function signUp() {
    try {
      const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan token dan data user
        await SecureStoreUtils.setAuthData({
          token: result.data.token,
          user: result.data.user
        });

        Alert.alert(
          "Sukses", 
          result.message, 
          [{ 
            text: "OK", 
            onPress: () => navigation.navigate("BottomTab") 
          }]
        );
      } else {
        Alert.alert("Error", result.message || "Gagal melakukan registrasi");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat proses registrasi");
    }
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Error", "Nama lengkap harus diisi");
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert("Error", "Email harus diisi");
      return false;
    }
    if (!form.password.trim()) {
      Alert.alert("Error", "Password harus diisi");
      return false;
    }
    // Validasi email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Format email tidak valid");
      return false;
    }
    // Validasi password minimal 6 karakter
    if (form.password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return false;
    }
    return true;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      signUp();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign Up as {role === "client" ? "Client" : "Freelancer"}</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#6b7280" />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#6b7280" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#6b7280" />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6b7280" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry={!showPassword} value={form.password} onChangeText={(text) => setForm({ ...form, password: text })} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
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
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: -48,
  },
  header: {
    alignItems: "center",
    paddingVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    marginLeft: 12,
  },
  eyeButton: {
    padding: 8,
  },
  signUpButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
});
