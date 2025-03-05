import { View, StyleSheet, ScrollView, Text } from "react-native";
import Header from "./components/Header";
import ProfileInfo from "./components/ProfileInfo";
import Balance from "./components/Balance";
import Stats from "./components/Stats";
import About from "./components/About";
import Skills from "./components/Skills";
import Services from "./components/Services";
import { useUser } from "@/hooks/tanstack/useUser";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { COLORS } from "@/constant/color";
import SkeletonProfile from "./components/SkeletonProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
    const insets = useSafeAreaInsets();
    const { data: user, isLoading: loading, error, refetch } = useUser();

    useFocusEffect(
        useCallback(() => {
            refetch();
            return () => {
                // Cleanup jika diperlukan
            };
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <Header />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SkeletonProfile />
                </ScrollView>
            </View>
        );
    }

    if (error || !user) {
        return (
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <Header />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Tidak dapat memuat data profil 😕</Text>
                    <Text style={styles.errorDescription}>{error?.message}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <Header />
                    <ProfileInfo 
                        fullName={user.fullName}
                        location={user.location || 'Belum diatur'}
                        profileImage={user.profileImage || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                        rating={user.rating || 0}
                        totalReviews={user.totalReviews || 0}
                    />
                    <Balance balance={user.balance || 0} />
                    <Stats 
                        totalProjects={user.totalProjects || 0}
                        // successRate={user.successRate || 0}
                        services={user.services || []}
                        balance={user.balance || 0}
                        role={user.role || ''}
                    />
                    
                    {(!user.about && (!user.skills || user.skills.length === 0)) ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>📝</Text>
                            <Text style={styles.emptyDescription}>
                                Belum ada data tentang profil dan keahlian
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {user.about && <About about={user.about} />}
                            {user.skills && user.skills.length > 0 && (
                                <Skills skills={user.skills} />
                            )}
                        </View>
                    )}
                    
                    {user.role === 'freelancer' && <Services />}
                </View>
            </ScrollView>
        </View>
    );
}

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.error,
        marginBottom: 8,
    },
    errorDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(8, 145, 178, 0.05)',
        borderRadius: 16,
        marginVertical: 16,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(8, 145, 178, 0.1)',
    },
    emptyText: {
        fontSize: 50,
        marginBottom: 12,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        fontWeight: '500',
    },
});
