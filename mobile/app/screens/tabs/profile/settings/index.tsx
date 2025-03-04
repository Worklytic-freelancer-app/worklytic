import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, User, Bell, Lock, HelpCircle, LogOut } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { COLORS } from "@/constant/color";
import Confirmation from "@/components/Confirmation";
import { useState } from "react";
import Loading from "@/components/Loading";

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function Settings() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const settingsOptions = [
        { 
            icon: User, 
            title: "Edit Profile", 
            subtitle: "Change your profile information",
            onPress: () => navigation.navigate("EditProfile")
        },
        { icon: Bell, title: "Notifications", subtitle: "Manage your notifications" },
        { icon: Lock, title: "Privacy & Security", subtitle: "Control your privacy settings" },
        { icon: HelpCircle, title: "Help & Support", subtitle: "Get help or contact support" },
    ];

    const handleLogout = async () => {
        try {
            // Set loading di confirmation dulu
            setIsLoading(true);
            // Tutup confirmation dialog
            setShowConfirmation(false);
            // Clear auth data
            await SecureStoreUtils.clearAuthData();
            // Delay sebelum navigasi
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "SignIn" }],
                });
            }, 1500);
        } catch (error) {
            console.error("Error during logout:", error);
            setIsLoading(false);
            Alert.alert("Error", "Terjadi kesalahan saat proses logout");
        }
    };

    if (isLoading) {
        return <Loading size={150} />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {settingsOptions.map((option, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.settingItem}
                        onPress={option.onPress}
                    >
                        <View style={styles.settingIcon}>
                            <option.icon size={22} color={COLORS.darkGray} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>{option.title}</Text>
                            <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                        </View>
                        <ChevronLeft 
                            size={20} 
                            color={COLORS.gray} 
                            style={{ transform: [{ rotate: "180deg" }] }} 
                        />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity 
                    style={[styles.settingItem, styles.logoutButton]} 
                    onPress={() => setShowConfirmation(true)}
                >
                    <View style={[styles.settingIcon, { backgroundColor: `${COLORS.error}15` }]}>
                        <LogOut size={22} color={COLORS.error} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingTitle, { color: COLORS.error }]}>Log Out</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <Confirmation
                visible={showConfirmation}
                title="Konfirmasi Logout"
                message="Apakah kamu yakin ingin keluar dari aplikasi?"
                type="warning"
                confirmText="Logout"
                cancelText="Batal"
                onConfirm={handleLogout}
                onCancel={() => setShowConfirmation(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.inputBackground,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.black,
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
        backgroundColor: COLORS.background,
    },
    settingIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.inputBackground,
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
        color: COLORS.black,
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 14,
        color: COLORS.gray,
    },
    logoutButton: {
        marginTop: 24,
    },
});
