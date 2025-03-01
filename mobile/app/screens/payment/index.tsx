import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, CreditCard, Wallet, Building2 } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";

export default function Payment() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const paymentMethods = [
        {
            id: 'credit_card',
            title: 'Kartu Kredit/Debit',
            icon: CreditCard,
            description: 'Bayar dengan Visa, Mastercard, atau JCB'
        },
        {
            id: 'e_wallet',
            title: 'E-Wallet',
            icon: Wallet,
            description: 'GoPay, OVO, DANA, LinkAja, ShopeePay'
        },
        {
            id: 'bank_transfer',
            title: 'Transfer Bank',
            icon: Building2,
            description: 'BCA, Mandiri, BNI, BRI'
        }
    ];

    const handlePayment = () => {
        if (!selectedMethod) {
            // Tampilkan pesan error
            return;
        }
        // Implementasi logika pembayaran sesuai metode yang dipilih
        console.log('Memproses pembayaran dengan:', selectedMethod);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pembayaran</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.projectSummary}>
                    <Text style={styles.sectionTitle}>Ringkasan Proyek</Text>
                    <View style={styles.summaryCard}>
                        <Text style={styles.projectTitle}>Pengembangan Sistem ERP Terintegrasi</Text>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Pembayaran</Text>
                            <Text style={styles.summaryValue}>Rp75.000.000</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Durasi Proyek</Text>
                            <Text style={styles.summaryValue}>6 bulan</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.paymentMethods}>
                    <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodCard,
                                selectedMethod === method.id && styles.selectedMethod
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={styles.methodIcon}>
                                <method.icon size={24} color="#2563eb" />
                            </View>
                            <View style={styles.methodInfo}>
                                <Text style={styles.methodTitle}>{method.title}</Text>
                                <Text style={styles.methodDescription}>{method.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[
                        styles.payButton,
                        !selectedMethod && styles.payButtonDisabled
                    ]}
                    onPress={handlePayment}
                    disabled={!selectedMethod}
                >
                    <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    projectSummary: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    summaryCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 16,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
        marginBottom: 12,
    },
    summaryItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    paymentMethods: {
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    selectedMethod: {
        borderColor: "#2563eb",
        backgroundColor: "#eff6ff",
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
        marginBottom: 4,
    },
    methodDescription: {
        fontSize: 14,
        color: "#6b7280",
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    payButton: {
        backgroundColor: "#2563eb",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    payButtonDisabled: {
        backgroundColor: "#93c5fd",
    },
    payButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});