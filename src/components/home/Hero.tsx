import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import MyMlaCard from "./MyMlaCard";
import HomeBanner from "./HomeBanner";

const Hero = () => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const bannerHeight = isTablet ? height * 0.55 : height * 0.48;
  const titleFontSize = isTablet ? 34 : width < 360 ? 20 : 24;

  const [role, setRole] = useState<string | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem("role").then(setRole);
  }, []);

  const showMlaCard = role === "citizen" || role === "employee";

  return (
    <ScrollView
      style={styles.hero}
      contentContainerStyle={styles.heroContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Video Banner ── */}
      <View style={[styles.heroBanner, { height: bannerHeight }]}>
        <Video
  source={{
    uri: "https://res.cloudinary.com/dw5bky38i/video/upload/v1780556713/14723614_3840_2160_60fps_mqjgun.mp4",
  }}
  style={[StyleSheet.absoluteFill, { opacity: 0.25 }]}
  resizeMode={ResizeMode.COVER}
  shouldPlay
  isLooping
  isMuted
/>

        {/* Dark gradient top → status bar readability */}
        <LinearGradient
          colors={["rgba(230, 228, 228, 0.55)", "transparent"]}
          style={styles.gradientTop}
          pointerEvents="none"
        />

        {/* Strong gradient bottom → text legibility */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.78)"]}
          style={styles.gradientBottom}
          pointerEvents="none"
        />

        {/* Text content sits above both gradients */}
        <View style={styles.heroHeader}>
          <View style={styles.labelGroup}>
            <View style={styles.govPill}>
              <Text style={styles.govLabel}>{t("gov_label")}</Text>
            </View>
            <View style={styles.divisionDot} />
            <Text style={styles.constituencyLabel}>{t("constituency")}</Text>
          </View>

          <Text style={[styles.heroTitle, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.35 }]}>
            {t("hero_title_main")}{"\n"}
            <Text style={styles.heroTitleAccent}>{t("hero_title_sub")}</Text>
          </Text>

          <Text style={styles.description}>{t("hero_description")}</Text>

          <View style={styles.accentBar} />
        </View>
      </View>

      {/* ── Body ── */}
      <View style={[styles.heroLayout, isTablet && styles.heroLayoutTablet]}>

        {/* Welcome + MLA Card */}
        <View style={styles.topCard}>
          <View style={styles.guestCard}>
            <View style={styles.guestCardIcon}>
              <Text style={styles.guestCardIconText}></Text>
            </View>
            <Text style={styles.guestCardTitle}>{t("welcome_entemla")}</Text>
            <Text style={styles.guestCardDesc}>{t("welcome_entemla_desc")}</Text>
          </View>
          {showMlaCard && <MyMlaCard />}
        </View>

        {/* Split: Banner + Info Briefs */}
        <View style={[styles.splitSection, isTablet && styles.splitSectionRow]}>
          <View style={[styles.bannerSide, isTablet && { flex: 1 }]}>
            <HomeBanner />
          </View>

          <View style={[styles.sideBrief, isTablet && styles.sideBriefTablet]}>
            <BriefSection
              heading={t("live_complaint_activity")}
              items={[t("activity_1"), t("activity_2"), t("activity_3")]}
              accent="#2563eb"
            />
            <BriefSection
              heading={t("transparency_response")}
              items={[t("response_1"), t("response_2")]}
              accent="#059669"
            />
            <BriefSection
              heading={t("smart_governance")}
              items={[t("smart_1"), t("smart_2"), t("smart_3")]}
              accent="#7c3aed"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

/* ── Sub-components ── */

const BriefSection = ({
  heading,
  items,
  accent,
}: {
  heading: string;
  items: string[];
  accent: string;
}) => (
  <View style={[styles.briefSection, { borderLeftColor: accent }]}>
    <View style={styles.briefHeadingRow}>
      <View style={[styles.briefDot, { backgroundColor: accent }]} />
      <Text style={styles.briefHeading}>{heading}</Text>
    </View>
    {items.map((item, i) => (
      <BulletItem key={i} text={item} accent={accent} />
    ))}
  </View>
);

const BulletItem = ({ text, accent }: { text: string; accent: string }) => (
  <View style={styles.bulletItem}>
    <Text style={[styles.bullet, { color: accent }]}>›</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/* ── Styles ── */
const styles = StyleSheet.create({
  hero: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  heroContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  /* Video Banner */
  heroBanner: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    zIndex: 1,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    zIndex: 1,
  },
  heroHeader: {
    zIndex: 2,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 16,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  govPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  govLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  divisionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  constituencyLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroTitleAccent: {
    color: "#93c5fd",
  },
  description: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 480,
  },
  accentBar: {
    marginTop: 16,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
  },

  /* Body */
  heroLayout: {
    padding: 16,
    gap: 16,
  },
  heroLayoutTablet: {
    paddingHorizontal: 24,
  },

  /* Top card */
  topCard: {
    gap: 12,
  },
  guestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  guestCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  guestCardIconText: { fontSize: 20 },
  guestCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 5,
  },
  guestCardDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
  },

  /* Split section */
  splitSection: { gap: 16 },
  splitSectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bannerSide: { width: "100%" },

  /* Side brief */
  sideBrief: { gap: 12 },
  sideBriefTablet: {
    flex: 1,
    paddingLeft: 16,
  },
  briefSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  briefHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  briefDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  briefHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a5f",
    flexShrink: 1,
  },

  /* Bullets */
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 20,
    marginRight: 6,
    fontWeight: "700",
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 19,
  },
});

export default Hero;