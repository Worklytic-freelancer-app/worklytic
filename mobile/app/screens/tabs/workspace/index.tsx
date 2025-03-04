import React from "react";
import Client from "./client";
import Freelancer from "./freelancer";
import { useUser } from "@/hooks/tanstack/useUser";
import Loading from "@/components/Loading";

export default function Workspace() {
    const { data: user, isLoading: loading } = useUser();

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            {user?.role === 'client' ? <Client /> : <Freelancer />}
        </>
    );
}
