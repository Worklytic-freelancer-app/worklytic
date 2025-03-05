import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constant/color";
import React from "react";
import { Service } from "@/hooks/tanstack/useUser";

interface StatsProps {
  totalProjects: number;
  services: Service[];
  balance: number;
  role: string;
}

export default function Stats({ totalProjects, services, balance , role}: StatsProps) {
  return (
    <View style={styles.statsContainer}>
      {role === "freelancer" ? (
        <>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{services.length}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.divider} />
        </>
      ):(
        <>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.divider} />
        </>
      )}
      {/* <View style={styles.statItem}>
        <Text style={styles.statNumber}>{successRate}%</Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View> */}
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>Rp{(balance/1000000).toFixed(1)}M</Text>
        <Text style={styles.statLabel}>Earned</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },
}); 