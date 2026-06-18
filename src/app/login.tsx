import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  TextStyle,
  ViewStyle,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";


type Role = "citizen" | "mla" | "employee";

interface LoginResponse {
  user: Record<string, unknown>;
  token: string;
}

interface ApiError {
  message?: string;
}

const C = {
  ink: "#030f18",
  muted: "#4b6478",
  mutedLt: "#8fa3b1",
  sky: "#38bdf8",
  skydd: "#0e7490",
  teal: "#14b8a6",
  white: "#ffffff",
  red: "#ef4444",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
} as const;

const getItem = async (key: string) => {
  try { return await AsyncStorage.getItem(key); } catch { return null; }
};
const setItem = async (key: string, value: string) =>
  AsyncStorage.setItem(key, value);
const removeItem = async (key: string) =>
  AsyncStorage.removeItem(key);

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [focusedField, setFocusedField] = useState<"id" | "pw" | null>(null);
  const [loading, setLoading] = useState(false);

  // Feedback modal state
  const [modal, setModal] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    userName?: string;
  }>({ visible: false, type: "success", title: "", message: "" });

  useEffect(() => {
  const init = async () => {
    console.log("Login mounted");
  };

  init();
}, []);

  const handleLogin = async () => {
  if (!identifier.trim() || !password.trim()) {
    setModal({
      visible: true,
      type: "error",
      title: "Missing fields",
      message: "Please enter both email and password.",
    });
    return;
  }

  setLoading(true);

  try {
    const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: identifier,
      password,
    });

    const { user: userData, token } = response.data;

    await setItem("user", JSON.stringify(userData));
    await setItem("token", token);

    setModal({
      visible: true,
      type: "success",
      title: "Welcome back!",
      message: "Login successful",
    });

  } catch (error) {
    setModal({
      visible: true,
      type: "error",
      title: "Login failed",
      message: "Invalid credentials",
    });
  } finally {
    setLoading(false);
  }
};

  const handleModalClose = () => {
  setModal((m) => ({ ...m, visible: false }));

  if (modal.type === "success") {
    router.replace("/");
  }
};

  // const idLabel =
  //   role === "citizen" ? "Email Address" :
  //     role === "mla" ? "MLA ID" : "Employee ID";

  // const idPlaceholder =
  //   role === "citizen" ? "Enter your email" :
  //     role === "mla" ? "Enter your MLA ID" : "Enter your Employee ID";

  // const roleLabel =
  //   role === "citizen" ? "Citizen" :
  //     role === "mla" ? "MLA" : "Employee";

  return (
    <View style={[styles.page, { backgroundColor: "#eef8fa" }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} pointerEvents="none" />

      {/* <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      > */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (router as any).push("/")}
          >
            <Ionicons name="arrow-back" size={18} color="#0c2f47" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>
            Ente<Text style={styles.logoAccent}>MLA</Text>
          </Text>
        </View>

        {/* Hero text */}
        <View style={styles.heroDot}>
          <View style={styles.dot} />
          {/* <Text style={styles.heroTag}>{roleLabel} Portal</Text> */}
        </View>
        <Text style={styles.heading}>Welcome{"\n"}back.</Text>
        <Text style={styles.subheading}>
          Sign in to manage complaints{"\n"}and track progress.
        </Text>

        {/* Card */}
        <View style={styles.card}>

          {/* Role pill */}
          <View style={styles.rolePill}>
            <Ionicons
              name={
                role === "mla" ? "ribbon-outline" :
                  role === "employee" ? "construct-outline" : "person-outline"
              }
              size={13}
              color={C.skydd}
            />
            {/* <Text style={styles.rolePillText}>{roleLabel} Login</Text> */}
          </View>

          {/* ID field */}
          <View style={styles.formGroup}>
            {/* <Text style={styles.label}>{idLabel}</Text> */}
            <View style={[styles.inputBox, focusedField === "id" && styles.inputBoxFocused]}>
              <Ionicons
                name={role === "citizen" ? "mail-outline" : "id-card-outline"}
                size={16}
                color={focusedField === "id" ? C.teal : C.mutedLt}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                // placeholder={idPlaceholder}
                placeholderTextColor={C.mutedLt}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType={role === "citizen" ? "email-address" : "default"}
                // onFocus={() => setFocusedField("id")}
                // onBlur={() => setFocusedField(null)}
                onFocus={() => console.log("Focused")}
                onBlur={() => console.log("Blurred")}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputBox, focusedField === "pw" && styles.inputBoxFocused]}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={focusedField === "pw" ? C.teal : C.mutedLt}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={C.mutedLt}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                // onFocus={() => setFocusedField("pw")}
                // onBlur={() => setFocusedField(null)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={C.mutedLt}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          {role === "citizen" && (
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Not registered? </Text>
              <TouchableOpacity onPress={() => (router as any).push("/register")}>
                <Text style={styles.registerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footerText}>© 2026 Digital Governance Initiative</Text>
        </View>

        {/* Trust row */}
        <View style={styles.trustRow}>
          {[
            { icon: "shield-checkmark-outline" as const, label: "Secure" },
            { icon: "lock-closed-outline" as const, label: "Encrypted" },
            { icon: "ribbon-outline" as const, label: "Official" },
          ].map((b) => (
            <View key={b.label} style={styles.trustBadge}>
              <Ionicons name={b.icon} size={14} color={C.teal} />
              <Text style={styles.trustLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* </KeyboardAvoidingView> */}

      {/* ── Feedback Modal ── */}
      <Modal visible={modal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {modal.type === "success" ? (
              <>
                {/* Success icon */}
                <View style={styles.successRing}>
                  <View style={styles.successCircle}>
                    <Ionicons name="checkmark" size={36} color="#fff" />
                  </View>
                </View>

                <Text style={styles.modalTitle}>You're in!</Text>
                {modal.userName && (
                  <Text style={styles.modalName}>Hello, {modal.userName} 👋</Text>
                )}
                <Text style={styles.modalMessage}>{modal.message}</Text>

                <TouchableOpacity style={styles.successBtn} onPress={handleModalClose}>
                  <Text style={styles.successBtnText}>Go to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Error icon */}
                <View style={styles.errorRing}>
                  <View style={styles.errorCircle}>
                    <Ionicons name="close" size={36} color="#fff" />
                  </View>
                </View>

                <Text style={styles.modalTitle}>{modal.title}</Text>
                <Text style={styles.modalMessage}>{modal.message}</Text>

                <TouchableOpacity style={styles.errorBtn} onPress={handleModalClose}>
                  <Text style={styles.errorBtnText}>Try Again</Text>
                </TouchableOpacity>

                {role === "citizen" && (
                  <TouchableOpacity
                    style={styles.errorSecondary}
                    onPress={() => {
                      setModal((m) => ({ ...m, visible: false }));
                      (router as any).push("/register");
                    }}
                  >
                    <Text style={styles.errorSecondaryText}>Create an account instead</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1 },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(240,254,255,0.82)",
  },

  scroll: {
    flexGrow: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 56,
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
    backgroundColor: "rgba(255,255,255,0.75)",
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
  heroDot: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#14b8a6" },
  heroTag: {
    fontSize: 12, fontWeight: "700", color: "#0e7490",
    letterSpacing: 1.2, textTransform: "uppercase",
  },
  heading: {
    fontSize: 44, fontWeight: "900", color: "#0c2f47",
    lineHeight: 50, marginBottom: 10,
  },
  subheading: {
    fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 28,
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.15)",
    shadowColor: "#0e7490",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    gap: 14,
  },

  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(20,184,166,0.08)",
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.2)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rolePillText: { fontSize: 12, fontWeight: "700", color: "#0e7490" },

  formGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: "#0c2f47", letterSpacing: 0.4 },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fffe",
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "rgba(20,184,166,0.2)",
  },
  inputBoxFocused: {
    borderColor: "#14b8a6",
    backgroundColor: "#fff",
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#0c2f47", paddingVertical: 0 },
  eyeBtn: { padding: 4 },

  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0e7490",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
    shadowColor: "#0e7490",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 4,
  },
  registerText: { fontSize: 13, color: "#64748b" },
  registerLink: { fontSize: 13, color: "#0e7490", fontWeight: "700" },

  footerText: {
    fontSize: 11, color: "#94a3b8", textAlign: "center",
    letterSpacing: 0.8, marginTop: 4,
  },

  // Trust
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
  },

  // Success
  successRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(20,184,166,0.1)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  successCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#14b8a6",
    alignItems: "center", justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24, fontWeight: "900", color: "#0c2f47",
    marginBottom: 6, textAlign: "center",
  },
  modalName: {
    fontSize: 16, fontWeight: "700", color: "#0e7490",
    marginBottom: 6, textAlign: "center",
  },
  modalMessage: {
    fontSize: 14, color: "#64748b", textAlign: "center",
    lineHeight: 22, marginBottom: 24,
  },
  successBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0e7490",
    borderRadius: 14,
    paddingVertical: 14,
    width: "100%",
  },
  successBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Error
  errorRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(239,68,68,0.08)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  errorCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#ef4444",
    alignItems: "center", justifyContent: "center",
  },
  errorBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  errorBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  errorSecondary: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  errorSecondaryText: {
    color: "#0e7490", fontWeight: "600", fontSize: 13,
    textDecorationLine: "underline",
  },
});