// src/components/home/Stats.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

const statConfig = [
    {
        key: 'totalComplaints',
        labelKey: 'totalComplaints',
        color: '#14b8a6',
        icon: '📋',
        bg: 'rgba(20,184,166,0.08)',
        border: 'rgba(20,184,166,0.25)',
        accentLight: 'rgba(20,184,166,0.15)',
    },
    {
        key: 'resolvedComplaints',
        labelKey: 'resolvedIssues',
        color: '#10b981',
        icon: '✅',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.25)',
        accentLight: 'rgba(16,185,129,0.15)',
    },
    {
        key: 'inProgressComplaints',
        labelKey: 'inProgress',
        color: '#f59e0b',
        icon: '⏳',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.25)',
        accentLight: 'rgba(245,158,11,0.15)',
    },
    {
        key: 'avgResponse',
        labelKey: 'avgResponseDays',
        color: '#0ea5e9',
        icon: '⚡',
        bg: 'rgba(14,165,233,0.08)',
        border: 'rgba(14,165,233,0.25)',
        accentLight: 'rgba(14,165,233,0.15)',
    },
];

const Stats = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [stats, setStats] = useState({
        totalComplaints: 0,
        resolvedComplaints: 0,
        inProgressComplaints: 0,
        avgResponse: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints/stats`
            );
            setStats(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.inner}>
                {/* Pills Row */}
                <View style={styles.topRow}>
                    <View style={styles.pill}>
                        <View style={styles.pillDot} />
                        <Text style={styles.pillText}>{t('civicAnalytics')}</Text>
                    </View>
                    <View style={styles.pillDivider} />
                    <View style={[styles.pill, styles.pillAlt]}>
                        <Text style={[styles.pillText, styles.pillTextAlt]}>
                            {t('publicTransparencyDashboard')}
                        </Text>
                    </View>
                </View>

                {/* Heading */}
                <Text style={styles.heading}>
                    {t('realTime')}{' '}
                    <Text style={styles.headingAccent}>{t('impactMetrics')}</Text>
                </Text>
                <Text style={styles.subheading}>{t('description')}</Text>

                {/* Main Layout */}
                <View style={[styles.layout, isDesktop && styles.layoutRow]}>
                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        {statConfig.map((cfg) => (
                            <View
                                key={cfg.key}
                                style={[
                                    styles.statCard,
                                    { backgroundColor: cfg.bg, borderColor: cfg.border },
                                ]}
                            >
                                <View style={[styles.iconWrap, { backgroundColor: cfg.accentLight }]}>
                                    <Text style={styles.statIcon}>{cfg.icon}</Text>
                                </View>
                                <Text style={[styles.statNum, { color: cfg.color }]}>
                                    {stats[cfg.key as keyof typeof stats]}
                                </Text>
                                <Text style={styles.statLabel}>{t(cfg.labelKey)}</Text>
                                <View style={[styles.cardAccentBar, { backgroundColor: cfg.color }]} />
                            </View>
                        ))}
                    </View>

                    {/* Side Panel */}
                    <View style={styles.side}>
                        {/* Overview */}
                        <View style={styles.sideCard}>
                            <View style={styles.sideCardHeader}>
                                <View style={styles.sideCardIconWrap}>
                                    <Text style={styles.sideCardIcon}>◆</Text>
                                </View>
                                <Text style={styles.sideCardTitle}>{t('platformOverview')}</Text>
                            </View>
                            <Text style={styles.sideCardText}>{t('platformOverviewText')}</Text>
                        </View>

                        {/* Live Status */}
                        <View style={styles.sideCard}>
                            <View style={styles.sideCardHeader}>
                                <View style={styles.sideCardIconWrap}>
                                    <Text style={styles.sideCardIcon}>◆</Text>
                                </View>
                                <Text style={styles.sideCardTitle}>{t('liveComplaintStatus')}</Text>
                            </View>
                            <View style={styles.statusList}>
                                {[
                                    { emoji: '🔵', key: 'liveStatus1' },
                                    { emoji: '🟢', key: 'liveStatus2' },
                                    { emoji: '🟠', key: 'liveStatus3' },
                                ].map((s) => (
                                    <View key={s.key} style={styles.statusItem}>
                                        <Text style={styles.statusEmoji}>{s.emoji}</Text>
                                        <Text style={styles.statusText}>{t(s.key)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={styles.cta}
                            onPress={() => {
                                const user = JSON.parse(localStorage.getItem('user') || 'null');
                                const role = localStorage.getItem('role');
                                if (user && role === 'citizen') {
                                    router.push('/citizendashboard');
                                } else {
                                    router.push('/login');
                                }
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={styles.ctaContent}>
                                <View>
                                    <Text style={styles.ctaTitle}>{t('fileComplaint')}</Text>
                                    <Text style={styles.ctaSub}>Make your voice heard</Text>
                                </View>
                            </View>
                            <View style={styles.ctaArrow}>
                                <Text style={styles.ctaArrowText}>→</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#f8fafc',
        paddingVertical: isDesktop ? 72 : 52,
        paddingHorizontal: isDesktop ? 40 : 20,
    },
    inner: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#64748b',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: 'rgba(20,184,166,0.1)',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#14b8a6',
    },
    pillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    pillAlt: {
        backgroundColor: 'rgba(15,118,110,0.08)',
        borderColor: 'rgba(15,118,110,0.2)',
    },
    pillTextAlt: { color: '#0f766e' },
    pillDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(20,184,166,0.3)',
    },
    heading: {
        fontSize: isDesktop ? 42 : 28,
        fontWeight: '900',
        textAlign: 'center',
        color: '#0f172a',
        lineHeight: isDesktop ? 52 : 36,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    headingAccent: { color: '#14b8a6' },
    subheading: {
        textAlign: 'center',
        fontSize: isDesktop ? 16 : 14,
        color: '#64748b',
        lineHeight: 24,
        marginBottom: 44,
        maxWidth: 560,
        alignSelf: 'center',
    },
    layout: { gap: 20 },
    layoutRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    grid: {
        flex: isDesktop ? 1.6 : undefined,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    statCard: {
        flex: 1,
        minWidth: '46%',
        borderRadius: 22,
        padding: isDesktop ? 24 : 18,
        borderWidth: 1.5,
        alignItems: 'flex-start',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#0c2f47',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    cardAccentBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    statIcon: { fontSize: 20 },
    statNum: {
        fontSize: isDesktop ? 40 : 32,
        fontWeight: '900',
        letterSpacing: -1,
        lineHeight: isDesktop ? 46 : 38,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
        fontWeight: '700',
        lineHeight: 17,
        letterSpacing: 0.2,
    },
    side: {
        flex: 1,
        gap: 14,
    },
    sideCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        shadowColor: '#0c2f47',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sideCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sideCardIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(20,184,166,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideCardIcon: { fontSize: 10, color: '#14b8a6' },
    sideCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0f172a',
        flex: 1,
    },
    sideCardText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
    },
    statusList: { gap: 10 },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 2,
    },
    statusEmoji: { fontSize: 15 },
    statusText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 },
    cta: {
        backgroundColor: '#0d4f4c',
        borderRadius: 22,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    ctaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    ctaTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#e2fffe',
        letterSpacing: 0.2,
    },
    ctaSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 3,
    },
    ctaArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#14b8a6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaArrowText: { fontSize: 18, color: '#fff', fontWeight: '700' },
});

export default Stats;