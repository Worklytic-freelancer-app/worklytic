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

export default function Profile() {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !user) {
    return null; // Atau tampilkan komponen error
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <Header />
          <ProfileInfo 
            fullName={user.fullName}
            location={user.location}
            profileImage={user.profileImage}
            rating={user.rating}
            totalReviews={user.totalReviews}
          />
          <Balance balance={user.balance} />
          <Stats 
            totalProjects={user.totalProjects}
            successRate={user.successRate}
            balance={user.balance}
          />
          
          {(!user.about && !user.skills || user.skills.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📝</Text>
              <Text style={styles.emptyDescription}>Belum ada data tentang profil dan keahlian</Text>
            </View>
          ) : (
            <View>
              {user.about && <About about={user.about} />}
              {user.skills && <Skills skills={user.skills} />}
            </View>
          )}
          <Services />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
