// src/components/home/Hero.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const Hero = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.hero}>
            <View style={styles.heroContent}>
                {/* Top Label */}
                <View style={styles.labelGroup}>
                    <Text style={styles.govLabel}>GOVERNMENT OF KERALA</Text>
                    <View style={styles.divider} />
                    <Text style={styles.constituencyLabel}>{t("constituency")}</Text>
                </View>

                {/* Main Title */}
                <Text style={styles.title}>
                    {t("hero_title_main")}{'\n'}
                    <Text style={styles.titleAccent}>{t("hero_title_sub")}</Text>
                </Text>

                <Text style={styles.description}>
                    {t("hero_description")}
                </Text>

                {/* Split Content */}
                <View style={styles.splitContainer}>
                    {/* Left - Inspirational Quote */}
                    <View style={styles.quoteCard}>
                        <Text style={styles.quoteMark}>“</Text>
                        <Text style={styles.quoteText}>
                            Be the change that you wish to see in the world.
                        </Text>
                        <Text style={styles.author}>— Mahatma Gandhi</Text>
                    </View>

                    {/* Right - Brief Highlights */}
                    <View style={styles.briefContainer}>
                        <View style={styles.briefCard}>
                            <Text style={styles.briefTitle}>{t("live_complaint_activity")}</Text>
                            <Text style={styles.bullet}>• {t("activity_1")}</Text>
                            <Text style={styles.bullet}>• {t("activity_2")}</Text>
                            <Text style={styles.bullet}>• {t("activity_3")}</Text>
                        </View>

                        <View style={styles.briefCard}>
                            <Text style={styles.briefTitle}>{t("transparency_response")}</Text>
                            <Text style={styles.bullet}>• {t("response_1")}</Text>
                            <Text style={styles.bullet}>• {t("response_2")}</Text>
                        </View>

                        <View style={styles.briefCard}>
                            <Text style={styles.briefTitle}>{t("smart_governance")}</Text>
                            <Text style={styles.bullet}>• {t("smart_1")}</Text>
                            <Text style={styles.bullet}>• {t("smart_2")}</Text>
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
        paddingTop: isMobile ? 60 : 80,
        paddingBottom: isMobile ? 50 : 70,
        paddingHorizontal: isMobile ? 16 : 24,
    },
    heroContent: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    labelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    govLabel: {
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 18,
        paddingVertical: 7,
        backgroundColor: 'rgba(20,184,166,0.12)',
        borderRadius: 30,
        color: '#0c2f47',
        borderWidth: 1.5,
        borderColor: '#14b8a6',
    },
    divider: {
        width: 3,
        height: 26,
        backgroundColor: '#14b8a6',
        borderRadius: 2,
    },
    constituencyLabel: {
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 18,
        paddingVertical: 7,
        backgroundColor: 'rgba(20,184,166,0.12)',
        borderRadius: 30,
        color: '#0c2f47',
        borderWidth: 1.5,
        borderColor: '#14b8a6',
    },
    title: {
        fontSize: isMobile ? 34 : 48,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: isMobile ? 42 : 56,
        color: '#0c2f47',
        marginBottom: 16,
        letterSpacing: -1.2,
    },
    titleAccent: {
        color: '#14b8a6',
    },
    description: {
        fontSize: isMobile ? 17 : 19,
        textAlign: 'center',
        color: '#0f766e',
        lineHeight: 28,
        maxWidth: 720,
        alignSelf: 'center',
        marginBottom: 40,
    },
    splitContainer: {
        flexDirection: isMobile ? 'column' : 'row',
        gap: 24,
    },
    quoteCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.25)',
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    quoteMark: {
        fontSize: 72,
        color: 'rgba(20,184,166,0.15)',
        marginBottom: -20,
    },
    quoteText: {
        fontSize: isMobile ? 19 : 22,
        fontWeight: '600',
        color: '#0c2f47',
        lineHeight: 32,
        marginBottom: 16,
    },
    author: {
        fontSize: 16,
        color: '#14b8a6',
        fontWeight: '700',
    },
    briefContainer: {
        flex: 1,
        gap: 16,
    },
    briefCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(20,184,166,0.2)',
    },
    briefTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0c2f47',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 15.5,
        color: '#475569',
        lineHeight: 26,
    },
});

export default Hero;