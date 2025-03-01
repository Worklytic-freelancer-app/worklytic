import React, { useState, useRef } from "react";
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { baseUrl } from "@/constant/baseUrl";
import { useUser } from "@/hooks/useUser";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface ProjectDiscussionProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
  projectId: string;
}

export default function ProjectDiscussion({ isVisible, onClose, onAccept, projectId }: ProjectDiscussionProps) {
  const [canAccept, setCanAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      setCanAccept(true);
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

  const handleAccept = async () => {
    try {
      setLoading(true);
      
      const token = await SecureStoreUtils.getToken();
      
      if (!user?._id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${baseUrl}/api/projects`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: projectId,
          freelancerId: user._id
        })
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          "Success",
          "You have successfully applied to this project",
          [{ text: "OK", onPress: () => {
            onAccept();
            onClose();
          }}]
        );
      } else {
        throw new Error(result.message || "Failed to apply to project");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to apply to project",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <View style={styles.pullBar} />
          </View>
          <Text style={styles.modalTitle}>Terms & Conditions</Text>

          <ScrollView ref={scrollViewRef} style={styles.termsScroll} onScroll={handleScroll} scrollEventThrottle={400}>
            <Text style={styles.termsText}>{termsAndConditions}</Text>
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom }]}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.buttonFlex, 
                  (!canAccept || loading) && styles.modalButtonDisabled
                ]} 
                disabled={!canAccept || loading} 
                onPress={handleAccept}
              >
                <Text style={[
                  styles.modalButtonText, 
                  (!canAccept || loading) && styles.modalButtonTextDisabled
                ]}>
                  {loading ? "Applying..." : canAccept ? "Accept & Continue" : "Please read all terms"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, styles.buttonFlex]} 
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end", // Changed from 'center' to 'flex-end'
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    height: "100%",
    padding: 20,
    paddingTop: 0, // Remove default padding top since we're using insets
  },
  modalFooter: {
    marginTop: 20,
    paddingBottom: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  pullBar: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  termsScroll: {
    flex: 1, // Changed to use flex
  },
  termsText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  modalButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextDisabled: {
    color: "#e5e7eb",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#4b5563",
  },
});
