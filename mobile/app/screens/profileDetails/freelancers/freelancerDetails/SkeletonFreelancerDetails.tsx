import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constant/color';
import Shimmer from '@/components/Shimmer';

export default function SkeletonFreelancerDetails() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.profile}>
                <Shimmer 
                    width={100} 
                    height={100} 
                    borderRadius={50} 
                    style={styles.profileImage} 
                />
                <Shimmer 
                    width={180} 
                    height={24} 
                    borderRadius={12} 
                    style={styles.nameBar} 
                />
                <Shimmer 
                    width={120} 
                    height={16} 
                    borderRadius={8} 
                    style={styles.roleBar} 
                />
                <Shimmer 
                    width={150} 
                    height={16} 
                    borderRadius={8} 
                    style={styles.locationBar} 
                />

                <View style={styles.statsContainer}>
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.statsCard}>
                            <Shimmer 
                                width={40} 
                                height={20} 
                                borderRadius={8} 
                                style={styles.statsValue} 
                            />
                            <Shimmer 
                                width={60} 
                                height={12} 
                                borderRadius={6} 
                                style={styles.statsLabel} 
                            />
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Shimmer 
                    width={100} 
                    height={20} 
                    borderRadius={8} 
                    style={styles.sectionTitle} 
                />
                <Shimmer 
                    width="100%" 
                    height={80} 
                    borderRadius={12} 
                    style={styles.aboutBar} 
                />
            </View>

            <View style={styles.section}>
                <Shimmer 
                    width={120} 
                    height={20} 
                    borderRadius={8} 
                    style={styles.sectionTitle} 
                />
                <View style={styles.contactInfo}>
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.contactItem}>
                            <Shimmer 
                                width={16} 
                                height={16} 
                                borderRadius={8} 
                            />
                            <Shimmer 
                                width={200} 
                                height={14} 
                                borderRadius={7} 
                                style={styles.contactText} 
                            />
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Shimmer 
                    width={80} 
                    height={20} 
                    borderRadius={8} 
                    style={styles.sectionTitle} 
                />
                <View style={styles.skillsContainer}>
                    {[1, 2, 3, 4].map((_, index) => (
                        <Shimmer 
                            key={index}
                            width={80} 
                            height={32} 
                            borderRadius={16} 
                            style={styles.skillBadge} 
                        />
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Shimmer 
                    width={80} 
                    height={20} 
                    borderRadius={8} 
                    style={styles.sectionTitle} 
                />
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.servicesContainer}
                >
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.serviceCard}>
                            <Shimmer 
                                width={280} 
                                height={150} 
                                style={styles.serviceImage} 
                            />
                            <View style={styles.serviceContent}>
                                <Shimmer 
                                    width={200} 
                                    height={16} 
                                    borderRadius={8} 
                                    style={styles.serviceTitle} 
                                />
                                <Shimmer 
                                    width={240} 
                                    height={32} 
                                    borderRadius={8} 
                                    style={styles.serviceDescription} 
                                />
                                <Shimmer 
                                    width={100} 
                                    height={16} 
                                    borderRadius={8} 
                                    style={styles.servicePrice} 
                                />
                                <View style={styles.serviceStats}>
                                    <Shimmer 
                                        width={60} 
                                        height={14} 
                                        borderRadius={7} 
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <Shimmer 
                width="90%" 
                height={50} 
                borderRadius={12} 
                style={styles.chatButton} 
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    profile: {
        alignItems: "center",
        paddingVertical: 24,
    },
    profileImage: {
        marginBottom: 16,
    },
    nameBar: {
        marginBottom: 8,
    },
    roleBar: {
        marginBottom: 12,
    },
    locationBar: {
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    statsCard: {
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 100,
    },
    statsValue: {
        marginBottom: 8,
    },
    statsLabel: {
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    aboutBar: {
        marginTop: 8,
    },
    contactInfo: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    contactText: {
        flex: 1,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    skillBadge: {
        backgroundColor: `${COLORS.primary}15`,
    },
    servicesContainer: {
        marginTop: 12,
    },
    serviceCard: {
        width: 280,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    serviceImage: {
        width: "100%",
    },
    serviceContent: {
        padding: 16,
        gap: 8,
    },
    serviceTitle: {
        marginBottom: 4,
    },
    serviceDescription: {
        marginBottom: 8,
    },
    servicePrice: {
        marginBottom: 8,
    },
    serviceStats: {
        flexDirection: "row",
        alignItems: "center",
    },
    chatButton: {
        alignSelf: 'center',
        marginVertical: 32,
    }
}); 