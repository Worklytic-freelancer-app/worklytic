import React, { useState, useRef } from "react";
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { COLORS } from '@/constant/color';
import Confirmation from "@/components/Confirmation";

type ProjectTermsRouteProp = RouteProp<RootStackParamList, "ProjectTerms">;

interface ProjectFeatureResponse {
    _id: string;
    projectId: string;
    freelancerId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProjectTerms() {
    const [canAccept, setCanAccept] = useState(false);
    const [showAlreadyApplied, setShowAlreadyApplied] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<ProjectTermsRouteProp>();
    
    // Gunakan useUser untuk mendapatkan data user
    const { data: userData } = useUser();
    
    // Gunakan useMutation untuk membuat project feature
    const createProjectFeatureMutation = useMutation<ProjectFeatureResponse, {
        projectId: string;
        freelancerId: string;
        status: string;
    }>({
        endpoint: 'projectfeatures',
        method: 'POST',
        requiresAuth: true,
        onSuccess: () => {
            // Navigasi ke halaman workspace
            navigation.navigate('Workspace');
        },
    });

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

        if (isCloseToBottom) {
            setCanAccept(true);
        }
    };

    const handleAccept = async () => {
        if (!canAccept || createProjectFeatureMutation.isPending) return;
        
        try {
            if (!userData?._id) {
                throw new Error('User ID tidak ditemukan');
            }

            if (!route.params.projectId) {
                throw new Error('Project ID tidak ditemukan');
            }
            
            await createProjectFeatureMutation.mutateAsync({
                projectId: route.params.projectId.toString(),
                freelancerId: userData._id.toString(),
                status: 'pending'
            });
            
        } catch (error) {
            console.error('Error applying to project:', error);
            
            if (error instanceof Error && error.message.includes('already applied')) {
                setShowAlreadyApplied(true);
                return;
            }
            
            throw error;
        }
    };

    const termsAndConditions = `
1. Project Terms and Agreement

1.1 Project Scope
- You agree to complete the project as specified in the project description
- Any changes to the scope must be agreed upon by both parties
- The timeline and deliverables are binding as stated in the project details

1.2 Payment Terms
- The agreed budget is final and inclusive of all fees
- Payment will be held in escrow until project completion
- Payment release is subject to deliverable acceptance

1.3 Communication
- Regular updates must be provided through the platform
- Response time should not exceed 24 hours
- All project-related communication must be done through Worklytic

1.4 Intellectual Property
- All final deliverables will become the property of the client
- You maintain rights to generic components and prior work
- Confidentiality must be maintained throughout the project

1.5 Dispute Resolution
- All disputes will be handled through Worklytic's mediation process
- Both parties agree to act in good faith to resolve any issues
- Worklytic's decision in disputes is final and binding

1.6 Project Completion
- Final delivery must meet all specified requirements
- The client has 7 days to review and accept deliverables
- Multiple revision rounds may be required within reason

2. Platform Guidelines

2.1 Professional Conduct
- Maintain professional communication at all times
- Respect intellectual property rights
- Adhere to platform's code of conduct

2.2 Quality Standards
- Deliver work that meets professional standards
- Follow industry best practices
- Maintain consistent quality throughout the project

2.3 Timeline Adherence
- Meet all agreed-upon deadlines
- Communicate delays proactively
- Provide realistic time estimates

3. Legal Compliance

3.1 Tax Obligations
- You are responsible for your own tax obligations
- Comply with local laws and regulations
- Maintain proper records of all transactions

3.2 Confidentiality
- Maintain client confidentiality
- Do not share project details publicly
- Protect sensitive information

4. Acceptance

By accepting these terms, you agree to:
- Abide by all platform rules and guidelines
- Complete the project as specified
- Maintain professional standards
- Accept Worklytic's dispute resolution process
- Comply with all legal requirements
  `;

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <View style={styles.pullBar} />
                </View>
                <Text style={styles.title}>Terms & Conditions</Text>

                <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef} style={styles.termsScroll} onScroll={handleScroll} scrollEventThrottle={400}>
                    <Text style={styles.termsText}>{termsAndConditions}</Text>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                styles.buttonFlex, 
                                (!canAccept || createProjectFeatureMutation.isPending) && styles.buttonDisabled
                            ]} 
                            disabled={!canAccept || createProjectFeatureMutation.isPending} 
                            onPress={handleAccept}
                        >
                            {createProjectFeatureMutation.isPending ? (
                                <ActivityIndicator size="small" color={COLORS.background} />
                            ) : (
                                <Text style={[styles.buttonText, !canAccept && styles.buttonTextDisabled]}>
                                    {canAccept ? "Accept & Continue" : "Please read all terms"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton, styles.buttonFlex]} 
                            onPress={() => navigation.goBack()}
                            disabled={createProjectFeatureMutation.isPending}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Confirmation
                visible={showAlreadyApplied}
                title="Sudah Melamar"
                message="Kamu sudah melamar untuk proyek ini"
                type="error"
                confirmText="OK"
                cancelText=""
                onConfirm={() => {
                    setShowAlreadyApplied(false);
                    navigation.goBack();
                }}
                onCancel={() => {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 8,
    },
    pullBar: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 16,
        textAlign: "center",
    },
    termsScroll: {
        flex: 1,
    },
    termsText: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
    },
    footer: {
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonFlex: {
        flex: 1,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: COLORS.primary,
    },
    buttonDisabled: {
        backgroundColor: `${COLORS.primary}50`,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextDisabled: {
        color: COLORS.lightGray,
    },
    cancelButton: {
        backgroundColor: COLORS.inputBackground,
    },
    cancelButtonText: {
        color: COLORS.darkGray,
    },
});
