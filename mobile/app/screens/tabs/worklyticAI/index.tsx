import React from "react";
import { useAuth } from "../../../hooks/tanstack/useAuth";
import WorklyticAIClient from "./client";
import WorklyticAIFreelancer from "./freelancer";

export default function WorklyticAI() {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "client" ? <WorklyticAIClient /> : <WorklyticAIFreelancer />}
    </>
  );
}
