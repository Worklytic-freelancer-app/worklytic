import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import SignUpForm from "./SignUpForm";

type SignUpScreenProps = {
  route?: {
    params?: {
      role?: "freelancer" | "client";
    };
  };
};

export default function SignUp({ route }: SignUpScreenProps) {
  const role = route?.params?.role;

  // If no role is provided, this shouldn't happen as we should navigate from SelectRole
  if (!role) {
    return null;
  }

  return <SignUpForm role={role} />;
}
