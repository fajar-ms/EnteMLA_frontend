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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    constituencyId: "",
    place: "",
    password: "",
    confirmPassword: "",
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
        name:           form.name,
        phone:          form.phone,
        email:          form.email,
        district:       form.district,
        constituencyId: form.constituencyId,
        place:          form.place,
        password:       form.password,
        role:           selectedRole,
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
        <View style={styles.card}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.backText}>← Back to Home</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>
              Ente<Text style={styles.logoAccent}>MLA</Text>
            </Text>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={selectedRole === "employee" ? "construct" : "person"}
                size={13}
                color="#0e7490"
              />
              <Text style={styles.roleText}>
                {selectedRole === "employee" ? "Employee Register" : "Citizen Register"}
              </Text>
            </View>
            <View style={styles.accentBar} />
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Name */}
            <View style={styles.inputBox}>
              <Ionicons name="person" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputBox}>
              <Ionicons name="call" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => handleChange("phone", v)}
              />
            </View>

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="mail" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
              />
            </View>

            {/* District Picker */}
            <View style={styles.inputBox}>
              <Ionicons name="map" size={16} color="#0e7490" style={styles.icon} />
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

            {/* Constituency Picker */}
            <View style={[styles.inputBox, !form.district && styles.inputBoxDisabled]}>
              <Ionicons name="business" size={16} color="#0e7490" style={styles.icon} />
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

            {/* Place */}
            <View style={styles.inputBox}>
              <Ionicons name="navigate" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Your Location"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={form.place}
                onChangeText={(v) => handleChange("place", v)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={form.password}
                onChangeText={(v) => handleChange("password", v)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#0e7490" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed" size={16} color="#0e7490" style={styles.icon} />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#0e7490" />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account →</Text>
              )}
            </TouchableOpacity>

            {/* Sign in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already registered? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Ionicons name="checkmark-circle" size={70} color="#14b8a6" />
            <Text style={styles.successText}>Registration Successful!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setShowPopup(false);
                router.replace("/");
              }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 16 : 40,
    paddingBottom: 40,
  },

  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 28,
    padding: 24,
    ...Platform.select({
      ios:     { shadowColor: "#14b8a6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 20 },
      android: { elevation: 6 },
    }),
  },

  backText: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo:       { fontSize: 22, fontWeight: "700", color: "#0c2f47" },
  logoAccent: { color: "#0e7490" },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0c2f47",
    marginTop: 8,
    marginBottom: 12,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,184,166,0.1)",
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.22)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleText: {
    color: "#0e7490",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  accentBar: {
    width: 36,
    height: 3,
    backgroundColor: "#38bdf8",
    borderRadius: 999,
    marginTop: 14,
  },

  form: { gap: 12 },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  inputBoxDisabled: { opacity: 0.45 },

  icon:   { marginRight: 10 },
  input:  { flex: 1, fontSize: 14, color: "#0c2f47" },
  picker: { flex: 1, color: "#0c2f47" },

  button: {
    backgroundColor: "#0e7490",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signinText: { fontSize: 13, color: "#64748b" },
  signinLink: { fontSize: 13, color: "#0e7490", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 24,
    alignItems: "center",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24 },
      android: { elevation: 8 },
    }),
  },
  successText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0c2f47",
    marginVertical: 16,
    textAlign: "center",
  },
});