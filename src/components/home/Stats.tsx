// Stats.tsx (React Native)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

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
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsSection}>
        <View style={styles.statsWrapper}>
          {/* TOP LABEL */}
          <View style={styles.statsTop}>
            <Text style={styles.statsLabel}>{t("civicAnalytics")}</Text>
            <View style={styles.statsLine} />
            <Text style={styles.statsSub}>{t("publicTransparencyDashboard")}</Text>
          </View>

          {/* HEADING */}
          <Text style={styles.statsHeading}>
            {t("realTime")}{" "}
            <Text style={styles.highlight}>{t("impactMetrics")}</Text>
          </Text>

          <Text style={styles.statsDescription}>
            {t("description")}
          </Text>

          {/* STATS CARDS */}
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

          {/* PLATFORM OVERVIEW */}
          <View style={styles.sideBlock}>
            <Text style={styles.sideTitle}>{t("platformOverview")}</Text>
            <Text style={styles.sideText}>{t("platformOverviewText")}</Text>
          </View>

          {/* LIVE STATUS */}
          <View style={styles.sideBlock}>
            <Text style={styles.sideTitle}>{t("liveComplaintStatus")}</Text>

            <View style={styles.infoList}>
              <View style={styles.listItem}>
                <View style={[styles.dot, styles.blue]} />
                <Text style={styles.listText}>{t("liveStatus1")}</Text>
              </View>

              <View style={styles.listItem}>
                <View style={[styles.dot, styles.green]} />
                <Text style={styles.listText}>{t("liveStatus2")}</Text>
              </View>

              <View style={styles.listItem}>
                <View style={[styles.dot, styles.orange]} />
                <Text style={styles.listText}>{t("liveStatus3")}</Text>
              </View>
            </View>
          </View>

          {/* FILE COMPLAINT BUTTON */}
          <TouchableOpacity
            style={styles.complaintBtn}
            onPress={() => {
              const user = localStorage.getItem("user");
              const role = localStorage.getItem("role");

              if (user && role === "citizen") {
                router.push('/citizendashboard');
              } else {
                localStorage.setItem("role", "citizen");
               router.push('/login');
              }
            }}
          >
            <Text style={styles.btnText}>{t("fileComplaint")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  statsSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f0f4f8", // Approximate background
  },
  statsWrapper: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  statsTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#1a5fa8",
  },
  statsLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.2)",
  },
  statsSub: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#8fa3bc",
  },
  statsHeading: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 48,
    color: "#0c1a2e",
    marginBottom: 12,
  },
  highlight: {
    fontStyle: "italic",
    color: "#1a5fa8",
  },
  statsDescription: {
    fontSize: 17,
    color: "#4a5f7a",
    lineHeight: 26,
    marginBottom: 40,
    maxWidth: 600,
  },
  statsGrid: {
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    backgroundColor: "rgba(248, 252, 255, 0.95)",
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(186, 219, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    alignItems: "center",
  },
  total: { borderLeftWidth: 5, borderLeftColor: "#60a5fa" },
  resolve: { borderLeftWidth: 5, borderLeftColor: "#4ade80" },
  progress: { borderLeftWidth: 5, borderLeftColor: "#fbbf24" },
  response: { borderLeftWidth: 5, borderLeftColor: "#a78bfa" },

  statNumber: {
    fontSize: 52,
    fontWeight: "800",
    color: "#0c1a2e",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8fa3bc",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sideBlock: {
    backgroundColor: "rgba(248, 252, 255, 0.85)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(186, 219, 255, 0.55)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  sideTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0c1a2e",
    marginBottom: 12,
  },
  sideText: {
    fontSize: 16,
    color: "#4a5f7a",
    lineHeight: 24,
  },
  infoList: {
    marginTop: 12,
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  blue: { backgroundColor: "#3b91e0" },
  green: { backgroundColor: "#22c55e" },
  orange: { backgroundColor: "#f59e0b" },
  listText: {
    fontSize: 16,
    color: "#4a5f7a",
    flex: 1,
  },
  complaintBtn: {
    backgroundColor: "#1a5fa8",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#1a5fa8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#4a5f7a",
  },
});

export default Stats;