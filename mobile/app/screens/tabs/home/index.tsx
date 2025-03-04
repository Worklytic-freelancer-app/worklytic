import Client from "./client";
import Freelancer from "./freelancer";
import React, { useEffect } from "react";
import { useUser } from "@/hooks/tanstack/useUser";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { handleAuthError } from "@/utils/handleAuthError";
import { RootStackParamList } from "@/navigators";
import Loading from "@/components/Loading";

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
    return <Loading />;
  }

  return (
    <>
      {user?.role === 'client' ? <Client /> : <Freelancer />}
    </>
  );
}
