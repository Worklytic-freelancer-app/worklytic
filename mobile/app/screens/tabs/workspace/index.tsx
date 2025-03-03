import React from "react";
import Client from "./client";
import Freelancer from "./freelancer";
import { useUser } from "@/hooks/tanstack/useUser";
import { View, ActivityIndicator } from "react-native";

export default function Workspace() {
    const { data: user, isLoading: loading } = useUser();

    if (loading) {
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
