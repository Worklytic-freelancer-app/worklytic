import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { Alert } from "react-native";
import { useAuth } from "@/hooks/tanstack/useAuth";
import { COLORS } from "@/constant/color";

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { signIn, isSigningIn, signInError } = useAuth();

  async function handleSignIn() {
    try {
      signIn(form, {
        onSuccess: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "BottomTab" }],
          });
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Gagal melakukan login");
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
      Alert.alert("Error", "Terjadi kesalahan saat proses login");
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.logoTitle}>Worklytic</Text>
        </View> */}

        <View style={styles.logoContainer}>
          <Image source={require("@/assets/Worklytic.png")} style={styles.logoImage} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Worklytic</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
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
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={COLORS.gray} secureTextEntry={!showPassword} value={form.password} onChangeText={(text) => setForm({ ...form, password: text })} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              {showPassword ? <EyeOff size={20} color={COLORS.gray} /> : <Eye size={20} color={COLORS.gray} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.signInButton, isSigningIn && styles.disabledButton]} onPress={handleSignIn} disabled={isSigningIn}>
            <Text style={styles.signInButtonText}>{isSigningIn ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* <TouchableOpacity style={styles.socialButton}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }} style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SelectRole")}>
            <Text style={styles.footerLink}>Sign Up</Text>
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
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    height: "100%",
  },
  eyeButton: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  signInButton: {
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
  signInButtonText: {
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
  socialButton: {
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
  socialButtonText: {
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
  logoImage: {
    width: 100,
    height: 100,
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
