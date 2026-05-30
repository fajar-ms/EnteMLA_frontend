// src/app/about.tsx
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/home/Navbar';

const { width } = Dimensions.get('window');

const About = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>{t("about.hero_title")}</Text>
                    <Text style={styles.heroSubtitle}>{t("about.hero_desc")}</Text>
                    <View style={styles.accentLine} />
                </View>

                {/* Main Content */}
                <View style={styles.aboutContainer}>

                    {/* What is EnteMLA */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="business" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.what_is_heading")}</Text>
                        </View>
                        <Text style={styles.cardText}>{t("about.what_is_p1")}</Text>
                        <Text style={styles.cardText}>{t("about.what_is_p2")}</Text>
                        <Text style={styles.cardText}>{t("about.what_is_p3")}</Text>
                    </View>

                    {/* Why We Built This */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="flag" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.why_heading")}</Text>
                        </View>

                        <Text style={styles.cardText}>{t("about.why_intro")}</Text>
                        <Text style={styles.sectionTitle}>{t("about.why_points_title")}</Text>

                        {/* Clean & Safe Array Rendering */}
                        {(t("about.why_points", { returnObjects: true }) as string[] || []).map((point: string, index: number) => (
                            <Text key={index} style={styles.listItem}>• {point}</Text>
                        ))}

                        <Text style={styles.cardText}>{t("about.why_outro")}</Text>
                    </View>

                    {/* Key Features */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="sparkles" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.features_heading")}</Text>
                        </View>

                        <View style={styles.featuresGrid}>
                            {[
                                { icon: "warning", title: "about.feature_1_title", desc: "about.feature_1_desc" },
                                { icon: "trending-up", title: "about.feature_2_title", desc: "about.feature_2_desc" },
                                { icon: "construct", title: "about.feature_3_title", desc: "about.feature_3_desc" },
                                { icon: "handshake", title: "about.feature_4_title", desc: "about.feature_4_desc" },
                                { icon: "notifications", title: "about.feature_5_title", desc: "about.feature_5_desc" },
                                { icon: "shield-checkmark", title: "about.feature_6_title", desc: "about.feature_6_desc" },
                            ].map((feature, index) => (
                                <View key={index} style={styles.featureBox}>
                                    <View style={styles.featureIconWrapper}>
                                        <Ionicons name={feature.icon as any} size={32} color="white" />
                                    </View>
                                    <Text style={styles.featureTitle}>{t(feature.title)}</Text>
                                    <Text style={styles.featureDesc}>{t(feature.desc)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* How It Works */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="cog" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.how_heading")}</Text>
                        </View>

                        <View style={styles.stepsContainer}>
                            {[1, 2, 3, 4].map((step) => (
                                <View key={step} style={styles.step}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{step}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.stepTitle}>{t(`about.step${step}_title`)}</Text>
                                        <Text style={styles.stepDesc}>{t(`about.step${step}_desc`)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* User Roles */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="people" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.roles_heading")}</Text>
                        </View>

                        <View style={styles.rolesGrid}>
                            {[
                                { icon: "person", title: "Citizen", desc: "about.role_citizen" },
                                { icon: "briefcase", title: "Employee", desc: "about.role_employee" },
                                { icon: "school", title: "MLA", desc: "about.role_mla" },
                            ].map((role, index) => (
                                <View key={index} style={styles.roleBox}>
                                    <View style={styles.roleIconWrapper}>
                                        <Ionicons name={role.icon as any} size={36} color="white" />
                                    </View>
                                    <Text style={styles.roleTitle}>{role.title}</Text>
                                    <Text style={styles.roleDesc}>{t(role.desc)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Vision & Future Goals */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="globe" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.vision_heading")}</Text>
                        </View>
                        <Text style={styles.cardText}>{t("about.vision_p1")}</Text>
                        <Text style={styles.cardText}>{t("about.vision_p2")}</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="rocket" size={28} color="white" />
                            </View>
                            <Text style={styles.cardTitle}>{t("about.future_heading")}</Text>
                        </View>
                        {["future_1", "future_2", "future_3", "future_4", "future_5"].map((key, i) => (
                            <Text key={i} style={styles.listItem}>• {t(`about.${key}`)}</Text>
                        ))}
                    </View>

                  {/* Image Section */}
                  {/*}  <View style={styles.imageSection}>
                        <Image
                            source={require('../../assets/bg2.png')}
                            style={styles.aboutImage}
                        />
                    </View>*/}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8feff' },
    scrollContent: { paddingBottom: 40 },
    hero: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f0feff',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#0c2f47',
        textAlign: 'center',
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#0f766e',
        textAlign: 'center',
        maxWidth: 700,
    },
    accentLine: {
        height: 4,
        width: 80,
        backgroundColor: '#14b8a6',
        marginTop: 20,
        borderRadius: 2,
    },
    aboutContainer: {
        paddingHorizontal: 20,
        gap: 30,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.3)',
        shadowColor: '#14b8a6',
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        backgroundColor: '#14b8a6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0c2f47',
    },
    cardText: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0c2f47',
        marginVertical: 12,
    },
    listItem: {
        fontSize: 16,
        color: '#475569',
        marginBottom: 8,
        paddingLeft: 8,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    featureBox: {
        width: width > 768 ? '48%' : '100%',
        backgroundColor: '#f9ffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    featureIconWrapper: {
        width: 56,
        height: 56,
        backgroundColor: '#14b8a6',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0c2f47',
        marginBottom: 8,
    },
    featureDesc: {
        color: '#475569',
        fontSize: 15,
    },
    stepsContainer: {
        gap: 16,
    },
    step: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#f9ffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    stepNumber: {
        width: 48,
        height: 48,
        backgroundColor: '#14b8a6',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0c2f47',
    },
    stepDesc: {
        color: '#475569',
        marginTop: 4,
    },
    rolesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    roleBox: {
        flex: 1,
        minWidth: 260,
        backgroundColor: '#f9ffff',
        padding: 24,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    roleIconWrapper: {
        width: 70,
        height: 70,
        backgroundColor: '#14b8a6',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0c2f47',
        marginBottom: 8,
    },
    roleDesc: {
        textAlign: 'center',
        color: '#475569',
    },
    imageSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    aboutImage: {
        width: '100%',
        maxHeight: 300,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
    },
});

export default About;