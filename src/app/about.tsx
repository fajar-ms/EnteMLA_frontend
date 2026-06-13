// src/app/about.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
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
        <ImageBackground
          source={{ uri: 'https://i.postimg.cc/xC3v5cLV/2.png' }}
          style={styles.hero}
          imageStyle={{ opacity: 0.9 }}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              {t("about.hero_title")}
            </Text>
            <Text style={styles.heroSubtitle}>
              {t("about.hero_desc")}
            </Text>
            <View style={styles.accentLine} />
          </View>
        </ImageBackground>

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

            {(t("about.why_points", { returnObjects: true }) as string[] || []).map((point: string, index: number) => (
              <Text key={index} style={styles.listItem}>— {point}</Text>
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
                  <View style={styles.stepContent}>
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
              <Text key={i} style={styles.listItem}>— {t(`about.${key}`)}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  hero: {
    minHeight: 480,
    paddingTop: 110,
    paddingBottom: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240, 253, 250, 0.75)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 58,
    letterSpacing: -1.8,
    marginBottom: 18,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 28,
    fontWeight: '300',
  },
  accentLine: {
    height: 4,
    width: 68,
    backgroundColor: '#14b8a6',
    borderRadius: 999,
    marginTop: 24,
  },
  aboutContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 32,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 22,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    backgroundColor: '#14b8a6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.6,
  },
  cardText: {
    fontSize: 16.5,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#0f172a',
    marginVertical: 16,
  },
  listItem: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 10,
    paddingLeft: 8,
    lineHeight: 25,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  featureBox: {
    width: width > 768 ? '48%' : '100%',
    backgroundColor: '#f0fdfa',
    padding: 26,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.25)',
  },
  featureIconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#14b8a6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 19.5,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10,
  },
  featureDesc: {
    color: '#64748b',
    fontSize: 15.5,
    lineHeight: 24,
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#f0fdfa',
    padding: 26,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.25)',
  },
  stepNumber: {
    width: 54,
    height: 54,
    backgroundColor: '#14b8a6',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18.5,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  stepDesc: {
    color: '#475569',
    fontSize: 15.5,
    lineHeight: 24,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  roleBox: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#f0fdfa',
    padding: 30,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.25)',
  },
  roleIconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#14b8a6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  roleDesc: {
    textAlign: 'center',
    color: '#475569',
    lineHeight: 24,
  },
});

export default About;