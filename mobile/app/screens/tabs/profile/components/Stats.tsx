import { View, Text, StyleSheet } from "react-native";

interface StatsProps {
  totalProjects: number;
  successRate: number;
  balance: number;
}

export default function Stats({ totalProjects, successRate, balance }: StatsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{totalProjects}</Text>
        <Text style={styles.statLabel}>Projects</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{successRate}%</Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>Rp{balance.toLocaleString('id-ID')}</Text>
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#f3f4f6",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
}); 