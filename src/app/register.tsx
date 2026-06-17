import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ImageBackground,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");

const constituencyMap: { [key: string]: { value: string; label: string }[] } = {
  thiruvananthapuram: [
    { value: "varkala", label: "Varkala" },
    { value: "attingal", label: "Attingal" },
    { value: "chirayinkeezhu", label: "Chirayinkeezhu" },
    { value: "nedumangad", label: "Nedumangad" },
    { value: "vamanapuram", label: "Vamanapuram" },
    { value: "kazhakkoottam", label: "Kazhakkoottam" },
    { value: "vattiyoorkavu", label: "Vattiyoorkavu" },
    { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
    { value: "nemom", label: "Nemom" },
    { value: "aruvikkara", label: "Aruvikkara" },
    { value: "parassala", label: "Parassala" },
    { value: "kattakkada", label: "Kattakkada" },
    { value: "kovalam", label: "Kovalam" },
    { value: "neyyattinkara", label: "Neyyattinkara" },
  ],
  kollam: [
    { value: "chadayamangalam", label: "Chadayamangalam" },
    { value: "kundara", label: "Kundara" },
    { value: "kottarakkara", label: "Kottarakkara" },
    { value: "pathanapuram", label: "Pathanapuram" },
    { value: "punalur", label: "Punalur" },
    { value: "chavara", label: "Chavara" },
    { value: "kollam", label: "Kollam" },
    { value: "eravipuram", label: "Eravipuram" },
    { value: "chathannoor", label: "Chathannoor" },
    { value: "karunagappally", label: "Karunagappally" },
    { value: "kunnathur", label: "Kunnathur" },
  ],
  pathanamthitta: [
    { value: "adoor", label: "Adoor" },
    { value: "konni", label: "Konni" },
    { value: "aranmula", label: "Aranmula" },
    { value: "ranni", label: "Ranni" },
    { value: "thiruvalla", label: "Thiruvalla" },
  ],
  alappuzha: [
    { value: "aroor", label: "Aroor" },
    { value: "cherthala", label: "Cherthala" },
    { value: "alappuzha", label: "Alappuzha" },
    { value: "ambalappuzha", label: "Ambalappuzha" },
    { value: "kuttanad", label: "Kuttanad" },
    { value: "haripad", label: "Haripad" },
    { value: "kayamkulam", label: "Kayamkulam" },
    { value: "mavelikkara", label: "Mavelikkara" },
    { value: "chengannur", label: "Chengannur" },
  ],
  kottayam: [
    { value: "puthuppally", label: "Puthuppally" },
    { value: "changanassery", label: "Changanassery" },
    { value: "kanjirappally", label: "Kanjirappally" },
    { value: "poonjar", label: "Poonjar" },
    { value: "pala", label: "Pala" },
    { value: "kaduthuruthy", label: "Kaduthuruthy" },
    { value: "vaikom", label: "Vaikom" },
    { value: "ettumanoor", label: "Ettumanoor" },
    { value: "kottayam", label: "Kottayam" },
  ],
  idukki: [
    { value: "peerumade", label: "Peerumade" },
    { value: "thodupuzha", label: "Thodupuzha" },
    { value: "idukki", label: "Idukki" },
    { value: "devikulam", label: "Devikulam" },
    { value: "udumbanchola", label: "Udumbanchola" },
  ],
  ernakulam: [
    { value: "piravom", label: "Piravom" },
    { value: "muvattupuzha", label: "Muvattupuzha" },
    { value: "kothamangalam", label: "Kothamangalam" },
    { value: "perumbavoor", label: "Perumbavoor" },
    { value: "angamaly", label: "Angamaly" },
    { value: "aluva", label: "Aluva" },
    { value: "kalamassery", label: "Kalamassery" },
    { value: "paravur", label: "Paravur" },
    { value: "vypin", label: "Vypin" },
    { value: "kochi", label: "Kochi" },
    { value: "thrippunithura", label: "Thrippunithura" },
    { value: "ernakulam", label: "Ernakulam" },
    { value: "thrikkakara", label: "Thrikkakara" },
    { value: "kunnathunad", label: "Kunnathunad" },
  ],
  thrissur: [
    { value: "guruvayur", label: "Guruvayur" },
    { value: "manalur", label: "Manalur" },
    { value: "wadakkanchery", label: "Wadakkanchery" },
    { value: "ollur", label: "Ollur" },
    { value: "thrissur", label: "Thrissur" },
    { value: "nattika", label: "Nattika" },
    { value: "irinjalakuda", label: "Irinjalakuda" },
    { value: "puthukkad", label: "Puthukkad" },
    { value: "chalakudy", label: "Chalakudy" },
    { value: "kodungallur", label: "Kodungallur" },
    { value: "kaipamangalam", label: "Kaipamangalam" },
    { value: "chelakkara", label: "Chelakkara" },
  ],
  palakkad: [
    { value: "thrithala", label: "Thrithala" },
    { value: "pattambi", label: "Pattambi" },
    { value: "shoranur", label: "Shoranur" },
    { value: "ottapalam", label: "Ottapalam" },
    { value: "kongad", label: "Kongad" },
    { value: "mannarkkad", label: "Mannarkkad" },
    { value: "malampuzha", label: "Malampuzha" },
    { value: "tarur", label: "Tarur" },
    { value: "chittur", label: "Chittur" },
    { value: "nenmara", label: "Nenmara" },
    { value: "alathur", label: "Alathur" },
    { value: "palakkad", label: "Palakkad" },
  ],
  malappuram: [
    { value: "kondotty", label: "Kondotty" },
    { value: "eranad", label: "Eranad" },
    { value: "nilambur", label: "Nilambur" },
    { value: "wandoor", label: "Wandoor" },
    { value: "manjeri", label: "Manjeri" },
    { value: "perinthalmanna", label: "Perinthalmanna" },
    { value: "mankada", label: "Mankada" },
    { value: "malappuram", label: "Malappuram" },
    { value: "vengara", label: "Vengara" },
    { value: "vallikkunnu", label: "Vallikkunnu" },
    { value: "tirurangadi", label: "Tirurangadi" },
    { value: "tanur", label: "Tanur" },
    { value: "tirur", label: "Tirur" },
    { value: "kottakkal", label: "Kottakkal" },
    { value: "thavanur", label: "Thavanur" },
    { value: "ponnani", label: "Ponnani" },
  ],
  kozhikode: [
    { value: "balussery", label: "Balussery" },
    { value: "elathur", label: "Elathur" },
    { value: "kozhikode_north", label: "Kozhikode North" },
    { value: "kozhikode_south", label: "Kozhikode South" },
    { value: "beypore", label: "Beypore" },
    { value: "kunnamangalam", label: "Kunnamangalam" },
    { value: "koduvally", label: "Koduvally" },
    { value: "thiruvambady", label: "Thiruvambady" },
    { value: "kuttiadi", label: "Kuttiadi" },
    { value: "nadapuram", label: "Nadapuram" },
    { value: "quilandy", label: "Quilandy" },
    { value: "perambra", label: "Perambra" },
    { value: "vadakara", label: "Vadakara" },
  ],
  wayanad: [
    { value: "mananthavady", label: "Mananthavady" },
    { value: "sulthan_bathery", label: "Sulthan Bathery" },
    { value: "kalpetta", label: "Kalpetta" },
  ],
  kannur: [
    { value: "payyannur", label: "Payyannur" },
    { value: "kalliasseri", label: "Kalliasseri" },
    { value: "taliparamba", label: "Taliparamba" },
    { value: "irikkur", label: "Irikkur" },
    { value: "azhikode", label: "Azhikode" },
    { value: "kannur", label: "Kannur" },
    { value: "dharmadom", label: "Dharmadom" },
    { value: "mattannur", label: "Mattannur" },
    { value: "peravoor", label: "Peravoor" },
    { value: "thalassery", label: "Thalassery" },
    { value: "koothuparamba", label: "Koothuparamba" },
  ],
  kasaragod: [
    { value: "manjeshwar", label: "Manjeshwar" },
    { value: "kasaragod", label: "Kasaragod" },
    { value: "udma", label: "Udma" },
    { value: "kanhangad", label: "Kanhangad" },
    { value: "trikaripur", label: "Trikaripur" },
  ],
};

const STEPS = [
  { id: 1, label: "Identity", icon: "person-outline" as const },
  { id: 2, label: "Location", icon: "map-outline" as const },
  { id: 3, label: "Security", icon: "shield-checkmark-outline" as const },
];

export default function Register() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    district: "", constituencyId: "", place: "",
    password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem("role").then(setSelectedRole);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "district" ? { constituencyId: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        district: form.district,
        constituencyId: form.constituencyId,
        place: form.place,
        password: form.password,
        role: selectedRole,
      };
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register`,
        payload
      );
      if (response.status === 201 || response.status === 200) {
        setShowPopup(true);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      Alert.alert("Error", Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.phone || !form.email)) {
      Alert.alert("Required", "Please fill in all identity fields");
      return;
    }
    if (step === 2 && (!form.district || !form.constituencyId || !form.place)) {
      Alert.alert("Required", "Please fill in all location fields");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <ImageBackground
      source={{ uri: "https://i.postimg.cc/xC3v5cLV/2.png" }}
      style={styles.page}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#0c2f47" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>
            Ente<Text style={styles.logoAccent}>MLA</Text>
          </Text>
        </View>

        {/* Hero tag */}
        <View style={styles.heroTag}>
          <View style={styles.heroDot} />
          <Text style={styles.heroTagText}>
            {selectedRole === "employee" ? "Employee Registration" : "Citizen Registration"}
          </Text>
        </View>

        {/* Big heading */}
        <Text style={styles.heading}>Join your{"\n"}community.</Text>
        <Text style={styles.subheading}>
          Your voice matters. Register to raise issues{"\n"}directly with your MLA.
        </Text>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <TouchableOpacity
                style={[styles.stepDot, step >= s.id && styles.stepDotActive]}
                onPress={() => step > s.id && setStep(s.id)}
              >
                {step > s.id ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Ionicons name={s.icon} size={14} color={step === s.id ? "#fff" : "#94a3b8"} />
                )}
              </TouchableOpacity>
              <Text style={[styles.stepLabel, step >= s.id && styles.stepLabelActive]}>
                {s.label}
              </Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, step > s.id && styles.stepLineActive]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Step 1 — Identity */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Personal Details</Text>
              

              <Field icon="person-outline" placeholder="Full Name"
                value={form.name} onChangeText={(v) => handleChange("name", v)} />
              <Field icon="call-outline" placeholder="Phone Number"
                value={form.phone} onChangeText={(v) => handleChange("phone", v)}
                keyboardType="phone-pad" />
              <Field icon="mail-outline" placeholder="Email Address"
                value={form.email} onChangeText={(v) => handleChange("email", v)}
                keyboardType="email-address" autoCapitalize="none" />

              <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                <Text style={styles.nextBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Personal Details</Text>

              {/* District */}
              <View style={styles.pickerBox}>
                <Ionicons name="map-outline" size={16} color="#0e7490" style={styles.fieldIcon} />
                <Picker
                  selectedValue={form.district}
                  style={styles.picker}
                  onValueChange={(v) => handleChange("district", v)}
                >
                  <Picker.Item label="Select District" value="" color="#94a3b8" />
                  {Object.keys(constituencyMap).map((dist) => (
                    <Picker.Item
                      key={dist}
                      label={dist.charAt(0).toUpperCase() + dist.slice(1)}
                      value={dist}
                    />
                  ))}
                </Picker>
              </View>

              {/* Constituency */}
              <View style={[styles.pickerBox, !form.district && { opacity: 0.4 }]}>
                <Ionicons name="business-outline" size={16} color="#0e7490" style={styles.fieldIcon} />
                <Picker
                  selectedValue={form.constituencyId}
                  enabled={!!form.district}
                  style={styles.picker}
                  onValueChange={(v) => handleChange("constituencyId", v)}
                >
                  <Picker.Item label="Select Constituency" value="" color="#94a3b8" />
                  {(constituencyMap[form.district] || []).map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>

              <Field icon="navigate-outline" placeholder="Your Town / Place"
                value={form.place} onChangeText={(v) => handleChange("place", v)} />

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backStepBtn} onPress={prevStep}>
                  <Ionicons name="arrow-back" size={18} color="#0e7490" />
                  <Text style={styles.backStepText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextBtn, { flex: 1 }]} onPress={nextStep}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3 — Security */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Secure your account.</Text>
              <Text style={styles.stepDesc}>Choose a strong password.</Text>

              {/* Password */}
              <View style={styles.fieldBox}>
                <Ionicons name="lock-closed-outline" size={16} color="#0e7490" style={styles.fieldIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  style={styles.fieldInput}
                  value={form.password}
                  onChangeText={(v) => handleChange("password", v)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldBox}>
                <Ionicons name="lock-closed-outline" size={16} color="#0e7490" style={styles.fieldIcon} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.fieldInput}
                  value={form.confirmPassword}
                  onChangeText={(v) => handleChange("confirmPassword", v)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Summary chip */}
              {form.name && form.district && (
                <View style={styles.summaryChip}>
                  <Ionicons name="person-circle-outline" size={18} color="#0e7490" />
                  <Text style={styles.summaryText} numberOfLines={1}>
                    {form.name} · {form.district.charAt(0).toUpperCase() + form.district.slice(1)}
                  </Text>
                </View>
              )}

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backStepBtn} onPress={prevStep}>
                  <Ionicons name="arrow-back" size={18} color="#0e7490" />
                  <Text style={styles.backStepText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 1 }, loading && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.nextBtnText}>Create Account</Text>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sign in link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.signinLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {[
            { icon: "shield-checkmark-outline" as const, label: "Secure" },
            { icon: "people-outline" as const, label: "Community" },
            { icon: "ribbon-outline" as const, label: "Official" },
          ].map((b) => (
            <View key={b.label} style={styles.trustBadge}>
              <Ionicons name={b.icon} size={16} color="#14b8a6" />
              <Text style={styles.trustLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>You're in!</Text>
            <Text style={styles.successSub}>
              Welcome to EnteMLA, {form.name.split(" ")[0]}.{"\n"}Your account has been created.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setShowPopup(false); router.replace("/"); }}
            >
              <Text style={styles.successBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// Reusable field component
function Field({
  icon, placeholder, value, onChangeText, keyboardType, autoCapitalize,
}: {
  icon: any; placeholder: string; value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any; autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldBox}>
      <Ionicons name={icon} size={16} color="#0e7490" style={styles.fieldIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || "words"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(240,254,255,0.82)",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 12 : 52,
    paddingBottom: 48,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.2)",
  },
  backText: { fontSize: 13, color: "#0c2f47", fontWeight: "500" },
  logo: { fontSize: 20, fontWeight: "900", color: "#0c2f47" },
  logoAccent: { color: "#14b8a6" },

  // Hero
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  heroDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#14b8a6",
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0e7490",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 38,
    fontWeight: "900",
    color: "#0c2f47",
    lineHeight: 44,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 28,
  },

  // Steps
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: "#14b8a6" },
  stepLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginHorizontal: 6,
  },
  stepLabelActive: { color: "#0e7490" },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    borderRadius: 1,
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: "#14b8a6" },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.15)",
    ...Platform.select({
      ios: { shadowColor: "#0e7490", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24 },
      android: { elevation: 6 },
    }),
  },

  stepContent: { gap: 14 },
  stepTitle: { fontSize: 20, fontWeight: "800", color: "#0c2f47" },
  stepDesc: { fontSize: 13, color: "#64748b", marginTop: -8, marginBottom: 4 },

  // Fields
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fffe",
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "rgba(20,184,166,0.2)",
  },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 14, color: "#0c2f47" },

  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fffe",
    borderRadius: 14,
    paddingLeft: 16,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "rgba(20,184,166,0.2)",
    overflow: "hidden",
  },
  picker: { flex: 1, color: "#0c2f47" },

  // Summary chip
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(20,184,166,0.08)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.2)",
  },
  summaryText: { fontSize: 13, color: "#0e7490", fontWeight: "600", flex: 1 },

  // Buttons
  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0e7490",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
  },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(14,116,144,0.08)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(14,116,144,0.15)",
  },
  backStepText: { color: "#0e7490", fontWeight: "600", fontSize: 14 },

  // Sign in
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  signinText: { fontSize: 13, color: "#64748b" },
  signinLink: { fontSize: 13, color: "#0e7490", fontWeight: "700" },

  // Trust badges
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.2)",
  },
  trustLabel: { fontSize: 11, fontWeight: "600", color: "#0e7490" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 28 },
      android: { elevation: 10 },
    }),
  },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#14b8a6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0c2f47",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successBtn: {
    backgroundColor: "#0e7490",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
  },
  successBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});