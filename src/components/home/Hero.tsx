// src/components/home/Hero.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const Hero = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.hero}>
            <View style={styles.heroGrid}>
                {/* Header */}
                <View style={styles.heroHeader}>
                    <View style={styles.labelGroup}>
                        <Text style={styles.govLabel}>{t("gov_label")}</Text>
                        <View style={styles.divisionLine} />
                        <Text style={styles.constituencyLabel}>{t("constituency")}</Text>
                    </View>

                    <Text style={styles.title}>
                        {t("hero_title_main")} {t("hero_title_sub")}
                    </Text>

                    <Text style={styles.description}>
                        {t("hero_description")}
                    </Text>
                </View>

                <View style={styles.heroContentSplit}>
                    {/* Left: Quote */}
                    <View style={styles.mainActions}>
                        <View style={styles.quoteContainer}>
                            <Text style={styles.quoteMark}>“</Text>
                            <Text style={styles.quoteText}>
                                Be the change that you wish to see in the world.
                            </Text>
                            <View style={styles.quoteFooter}>
                                <Text style={styles.author}>— Mahatma Gandhi</Text>
                            </View>
                        </View>
                    </View>

                    {/* Right: Brief Sections */}
                    <View style={styles.sideBrief}>
                        {/* Live Complaint Activity */}
                        <View style={styles.briefSection}>
                            <Text style={styles.briefTitle}>{t("live_complaint_activity")}</Text>
                            <View style={styles.bulletList}>
                                <Text style={styles.bulletItem}>• {t("activity_1")}</Text>
                                <Text style={styles.bulletItem}>• {t("activity_2")}</Text>
                                <Text style={styles.bulletItem}>• {t("activity_3")}</Text>
                            </View>
                        </View>

                        {/* Transparency & Response */}
                        <View style={styles.briefSection}>
                            <Text style={styles.briefTitle}>{t("transparency_response")}</Text>
                            <View style={styles.bulletList}>
                                <Text style={styles.bulletItem}>• {t("response_1")}</Text>
                                <Text style={styles.bulletItem}>• {t("response_2")}</Text>
                            </View>
                        </View>

                        {/* Smart Governance */}
                        <View style={styles.briefSection}>
                            <Text style={styles.briefTitle}>{t("smart_governance")}</Text>
                            <View style={styles.bulletList}>
                                <Text style={styles.bulletItem}>• {t("smart_1")}</Text>
                                <Text style={styles.bulletItem}>• {t("smart_2")}</Text>
                                <Text style={styles.bulletItem}>• {t("smart_3")}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    hero: {
        backgroundColor: '#f8ffff',
        paddingVertical: 50,
        paddingHorizontal: 16,
    },
    heroGrid: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    heroHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    labelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    govLabel: {
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(20, 184, 166, 0.15)',
        borderRadius: 20,
        color: '#0c2f47',
        borderWidth: 1.5,
        borderColor: 'rgba(20, 184, 166, 0.35)',
    },
    divisionLine: {
        width: 2,
        height: 24,
        backgroundColor: 'rgba(20, 184, 166, 0.4)',
    },
    constituencyLabel: {
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(20, 184, 166, 0.15)',
        borderRadius: 20,
        color: '#0c2f47',
        borderWidth: 1.5,
        borderColor: 'rgba(20, 184, 166, 0.35)',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 40,
        color: '#0c2f47',
        marginBottom: 16,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        color: '#0f766e',
        lineHeight: 26,
        maxWidth: 700,
    },
    heroContentSplit: {
        flexDirection: width > 768 ? 'row' : 'column',
        gap: 24,
    },
    mainActions: {
        flex: 1.2,
    },
    quoteContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: 'rgba(20, 184, 166, 0.3)',
    },
    quoteMark: {
        fontSize: 60,
        color: 'rgba(20, 184, 166, 0.2)',
        position: 'absolute',
        top: -15,
        left: 10,
    },
    quoteText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0c2f47',
        lineHeight: 28,
        marginTop: 20,
    },
    quoteFooter: {
        marginTop: 16,
    },
    author: {
        fontSize: 16,
        color: '#0f766e',
        fontWeight: '500',
    },
    sideBrief: {
        flex: 1,
        gap: 16,
    },
    briefSection: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(20, 184, 166, 0.25)',
    },
    briefTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0c2f47',
        marginBottom: 12,
    },
    bulletList: {
        gap: 8,
    },
    bulletItem: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
    },
});

export default Hero;