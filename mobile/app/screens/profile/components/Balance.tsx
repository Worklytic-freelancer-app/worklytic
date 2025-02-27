import { View, Text, StyleSheet } from "react-native";

interface BalanceProps {
  balance: number;
}

export default function Balance({ balance }: BalanceProps) {
  return (
    <View style={styles.balanceContainer}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceIconContainer}>
          <Text style={styles.balanceIcon}>S</Text>
        </View>
        <View style={styles.balanceTextContainer}>
          <Text style={styles.balanceLabel}>Worklytic Balance</Text>
          <Text style={styles.balanceAmount}>
            Rp{balance?.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceContainer: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 24,
    padding: 20,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  balanceIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
}); 