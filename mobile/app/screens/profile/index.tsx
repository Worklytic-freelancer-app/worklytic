import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./components/Header";
import ProfileInfo from "./components/ProfileInfo";
import Balance from "./components/Balance";
import Stats from "./components/Stats";
import About from "./components/About";
import Skills from "./components/Skills";
import Services from "./components/Services";
import { useUser } from "@/hooks/useUser";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


export default function Profile() {
  const { user, loading, error, refetch } = useUser();


  useFocusEffect(
    useCallback(() => {
      // Refetch data user dari SecureStore ketika layar mendapat fokus
      refetch();
      return () => {
        // Cleanup jika diperlukan
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tidak dapat memuat data profil</Text>
        <Text style={styles.errorDescription}>{error}</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <Header />
          <ProfileInfo 
            fullName={user.fullName}
            location={user.location || 'Belum diatur'}
            profileImage={user.profileImage}
            rating={user.rating || 0}
            totalReviews={user.totalReviews || 0}
          />
          <Balance balance={user.balance || 0} />
          <Stats 
            totalProjects={user.totalProjects || 0}
            successRate={user.successRate || 0}
            balance={user.balance || 0}
          />
          
          {(!user.about && (!user.skills || user.skills.length === 0)) ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📝</Text>
              <Text style={styles.emptyDescription}>Belum ada data tentang profil dan keahlian</Text>
            </View>
          ) : (
            <View>
              {user.about && <About about={user.about} />}
              {user.skills && user.skills.length > 0 && <Skills skills={user.skills} />}
            </View>
          )}
          <Services />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
