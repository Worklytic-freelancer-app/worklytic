import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, User, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { Alert } from "react-native";
import { useAuth } from "@/hooks/tanstack/useAuth";
import { COLORS } from "@/constant/color";

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

  const { signUp, isSigningUp } = useAuth();

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
      signUp(
        {
          fullName: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        },
        {
          onSuccess: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "BottomTab" }],
            });
          },
          onError: (error) => {
            Alert.alert("Error", error.message || "Gagal melakukan registrasi");
          },
        }
      );
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("SelectRole")}>
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image source={require("@/assets/Worklytic.png")} style={styles.logoImage} />
        </View>
        
        {/* <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.logoTitle}>Worklytic</Text>
        </View> */}

        <View style={styles.header}>
          <Text style={styles.title}>Sign Up as {role === "client" ? "Client" : "Freelancer"}</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <User size={20} color={COLORS.primary} />
            </View>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.gray} autoCapitalize="words" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Mail size={20} color={COLORS.primary} />
            </View>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.gray} keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color={COLORS.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              {showPassword ? <EyeOff size={20} color={COLORS.gray} /> : <Eye size={20} color={COLORS.gray} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.signUpButton, isSigningUp && styles.disabledButton]} onPress={handleSignUp} disabled={isSigningUp}>
            <Text style={styles.signUpButtonText}>{isSigningUp ? "Creating Account..." : "Create Account"}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* <TouchableOpacity style={styles.googleButton}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }} style={styles.socialIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.background,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.black,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    height: "100%",
  },
  eyeButton: {
    padding: 16,
  },
  signUpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    color: COLORS.background,
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
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.gray,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
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
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
});
