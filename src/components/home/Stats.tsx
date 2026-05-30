// src/components/home/Stats.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Stats = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [stats, setStats] = useState({
        totalComplaints: 0,
        resolvedComplaints: 0,
        inProgressComplaints: 0,
        avgResponse: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
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
                <Text style={styles.loadingText}>{t("loading")}</Text>
            </View>
        );
    }

    return (
        <View style={styles.statsSection}>
            <View style={styles.statsWrapper}>
                {/* Top Label */}
                <View style={styles.statsTop}>
                    <Text style={styles.statsLabel}>{t("civicAnalytics")}</Text>
                    <View style={styles.statsLine} />
                    <Text style={styles.statsSub}>{t("publicTransparencyDashboard")}</Text>
                </View>

                {/* Heading */}
                <Text style={styles.statsHeading}>
                    {t("realTime")} <Text style={styles.highlight}>{t("impactMetrics")}</Text>
                </Text>

                <Text style={styles.statsDescription}>
                    {t("description")}
                </Text>

                <View style={styles.statsLayout}>
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.total]}>
                            <Text style={styles.statNumber}>{stats.totalComplaints}</Text>
                            <Text style={styles.statLabel}>{t("totalComplaints")}</Text>
                        </View>

                        <View style={[styles.statCard, styles.resolve]}>
                            <Text style={styles.statNumber}>{stats.resolvedComplaints}</Text>
                            <Text style={styles.statLabel}>{t("resolvedIssues")}</Text>
                        </View>

                        <View style={[styles.statCard, styles.progress]}>
                            <Text style={styles.statNumber}>{stats.inProgressComplaints}</Text>
                            <Text style={styles.statLabel}>{t("inProgress")}</Text>
                        </View>

                        <View style={[styles.statCard, styles.response]}>
                            <Text style={styles.statNumber}>{stats.avgResponse}</Text>
                            <Text style={styles.statLabel}>{t("avgResponseDays")}</Text>
                        </View>
                    </View>

                    {/* Side Content */}
                    <View style={styles.statsSide}>
                        <View style={styles.sideBlock}>
                            <Text style={styles.sideTitle}>{t("platformOverview")}</Text>
                            <Text style={styles.sideText}>{t("platformOverviewText")}</Text>
                        </View>

                        <View style={styles.sideBlock}>
                            <Text style={styles.sideTitle}>{t("liveComplaintStatus")}</Text>
                            <View style={styles.infoList}>
                                <Text style={styles.listItem}>🔵 {t("liveStatus1")}</Text>
                                <Text style={styles.listItem}>🟢 {t("liveStatus2")}</Text>
                                <Text style={styles.listItem}>🟠 {t("liveStatus3")}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.complaintBtn}
                            onPress={() => {
                                const user = JSON.parse(localStorage.getItem('user') || 'null'); // Note: Use AsyncStorage in RN
                                const role = localStorage.getItem('role');

                                if (user && role === "citizen") {
                                    navigation.navigate('Citizen');
                                } else {
                                    // localStorage.setItem("role", "citizen"); // Use AsyncStorage
                                    navigation.navigate('Login');
                                }
                            }}
                        >
                            <Text style={styles.btnText}>{t("fileComplaint")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsSection: { paddingVertical: 50, paddingHorizontal: 16 },
    statsWrapper: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
    statsTop: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
    statsLabel: {
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderRadius: 20,
        color: '#0c2f47',
        borderWidth: 1.5,
        borderColor: 'rgba(20, 184, 166, 0.35)',
    },
    statsLine: { width: 2, height: 28, backgroundColor: 'rgba(20, 184, 166, 0.5)' },
    statsSub: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f766e',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        borderRadius: 20,
    },
    statsHeading: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        color: '#0c2f47',
        marginBottom: 12,
    },
    highlight: {
        color: '#14b8a6',
    },
    statsDescription: {
        textAlign: 'center',
        fontSize: 17,
        color: '#0f766e',
        lineHeight: 24,
        marginBottom: 30,
    },
    statsLayout: {
        flexDirection: width > 768 ? 'row' : 'column',
        gap: 24,
    },
    statsGrid: {
        flex: 1.5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(20, 184, 166, 0.25)',
        alignItems: 'center',
    },
    total: { borderTopColor: '#14b8a6' },
    resolve: { borderTopColor: '#10b981' },
    progress: { borderTopColor: '#f59e0b' },
    response: { borderTopColor: '#06b6d4' },
    statNumber: { fontSize: 32, fontWeight: '800', color: '#0c2f47' },
    statLabel: { fontSize: 15, color: '#0f766e', marginTop: 6, textAlign: 'center' },
    statsSide: { flex: 1, gap: 16 },
    sideBlock: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(20, 184, 166, 0.25)',
    },
    sideTitle: { fontSize: 18, fontWeight: '700', color: '#0c2f47', marginBottom: 10 },
    sideText: { color: '#475569', lineHeight: 22 },
    infoList: { gap: 10, marginTop: 8 },
    listItem: { fontSize: 16, color: '#475569' },
    complaintBtn: {
        backgroundColor: '#14b8a6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
    loadingContainer: { padding: 60, alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 16, color: '#0c2f47' },
});

export default Stats;