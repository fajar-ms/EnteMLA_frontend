import React from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Navbar from "../components/home/Navbar";

const { width } = Dimensions.get("window");

export default function About() {
  const { t } = useTranslation();

  const features = [
    {
      icon: "exclamation-triangle",
      title: t("about.feature_1_title"),
      desc: t("about.feature_1_desc"),
    },
    {
      icon: "chart-line",
      title: t("about.feature_2_title"),
      desc: t("about.feature_2_desc"),
    },
    {
      icon: "tools",
      title: t("about.feature_3_title"),
      desc: t("about.feature_3_desc"),
    },
    {
      icon: "handshake",
      title: t("about.feature_4_title"),
      desc: t("about.feature_4_desc"),
    },
    {
      icon: "bell",
      title: t("about.feature_5_title"),
      desc: t("about.feature_5_desc"),
    },
    {
      icon: "shield-alt",
      title: t("about.feature_6_title"),
      desc: t("about.feature_6_desc"),
    },
  ];

  return (
    <ImageBackground
      source={{ uri: "https://i.postimg.cc/xC3v5cLV/2.png" }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <Navbar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            {t("about.hero_title")}
          </Text>

          <Text style={styles.heroSubtitle}>
            {t("about.hero_desc")}
          </Text>
        </View>

        {/* WHAT IS ENTEMLA */}
        <View style={styles.card}>
          <SectionTitle
            icon="landmark"
            title={t("about.what_is_heading")}
          />

          <Text style={styles.text}>
            {t("about.what_is_p1")}
          </Text>

          <Text style={styles.text}>
            {t("about.what_is_p2")}
          </Text>

          <Text style={styles.text}>
            {t("about.what_is_p3")}
          </Text>
        </View>

        {/* WHY WE BUILT THIS */}
        <View style={styles.card}>
          <SectionTitle
            icon="bullseye"
            title={t("about.why_heading")}
          />

          <Text style={styles.text}>
            {t("about.why_intro")}
          </Text>

          <Text style={styles.sectionLabel}>
            {t("about.why_points_title")}
          </Text>

          {(
            t("about.why_points", {
              returnObjects: true,
            }) as string[]
          ).map((item, index) => (
            <Text key={index} style={styles.bullet}>
              • {item}
            </Text>
          ))}

          <Text style={styles.text}>
            {t("about.why_outro")}
          </Text>
        </View>

        {/* FEATURES */}
        <View style={styles.card}>
          <SectionTitle
            icon="magic"
            title={t("about.features_heading")}
          />

          <View style={styles.grid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <FontAwesome5
                  name={feature.icon as any}
                  size={26}
                  color="#14b8a6"
                />

                <Text style={styles.featureTitle}>
                  {feature.title}
                </Text>

                <Text style={styles.featureText}>
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={styles.card}>
          <SectionTitle
            icon="cogs"
            title={t("about.how_heading")}
          />

          {[1, 2, 3, 4].map((step) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>
                  {step}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>
                  {t(`about.step${step}_title`)}
                </Text>

                <Text style={styles.stepDesc}>
                  {t(`about.step${step}_desc`)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ROLES */}
        <View style={styles.card}>
          <SectionTitle
            icon="users"
            title={t("about.roles_heading")}
          />

          <View style={styles.grid}>
            <RoleCard
              icon="user"
              title="Citizen"
              text={t("about.role_citizen")}
            />

            <RoleCard
              icon="user-tie"
              title="Employee"
              text={t("about.role_employee")}
            />

            <RoleCard
              icon="user-graduate"
              title="MLA"
              text={t("about.role_mla")}
            />
          </View>
        </View>

        {/* VISION */}
        <View style={styles.card}>
          <SectionTitle
            icon="globe"
            title={t("about.vision_heading")}
          />

          <Text style={styles.text}>
            {t("about.vision_p1")}
          </Text>

          <Text style={styles.text}>
            {t("about.vision_p2")}
          </Text>
        </View>

        {/* FUTURE GOALS */}
        <View style={styles.card}>
          <SectionTitle
            icon="rocket"
            title={t("about.future_heading")}
          />

          {[1, 2, 3, 4, 5].map((item) => (
            <Text key={item} style={styles.bullet}>
              • {t(`about.future_${item}`)}
            </Text>
          ))}
        </View>

        {/* NEW IMAGE AT THE END OF THE PAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://i.postimg.cc/4d54Tq5G/bg2.png" }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <View style={styles.sectionTitleContainer}>
      <FontAwesome5
        name={icon}
        size={22}
        color="#14b8a6"
      />

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

function RoleCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureCard}>
      <FontAwesome5
        name={icon}
        size={28}
        color="#14b8a6"
      />

      <Text style={styles.featureTitle}>
        {title}
      </Text>

      <Text style={styles.featureText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  scrollContent: {
    paddingBottom: 50,
  },

  hero: {
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },

  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },

  heroSubtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#475569",
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionTitle: {
    marginLeft: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },

  text: {
    color: "#475569",
    lineHeight: 24,
    marginBottom: 10,
  },

  bullet: {
    color: "#475569",
    marginBottom: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  featureCard: {
    width: width > 700 ? "48%" : "100%",
    padding: 16,
    marginBottom: 15,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },

  featureTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
  },

  featureText: {
    marginTop: 8,
    color: "#64748b",
    lineHeight: 22,
  },

  step: {
    flexDirection: "row",
    marginBottom: 16,
  },

  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14b8a6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  stepNumber: {
    color: "#fff",
    fontWeight: "700",
  },

  stepTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },

  stepDesc: {
    color: "#64748b",
  },

  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 20,
  },
});