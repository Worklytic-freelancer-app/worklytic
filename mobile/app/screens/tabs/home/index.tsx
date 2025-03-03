import Client from "./client";
import Freelancer from "./freelancer";
import React, { useEffect } from "react";
import { useUser } from "@/hooks/tanstack/useUser";
import { View, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { handleAuthError } from "@/utils/handleAuthError";
import { RootStackParamList } from "@/navigators";

export default function Home() {
  const navigation = useNavigation();
  const { data: user, isLoading: userLoading, error } = useUser();

  useEffect(() => {
    // Tangani error autentikasi jika terjadi
    if (error) {
      handleAuthError(error, navigation as NavigationProp<RootStackParamList>);
    }
  }, [error, navigation]);

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      {user?.role === 'client' ? <Client /> : <Freelancer />}
    </>
  );
}
