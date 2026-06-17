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
  Alert,
  TextStyle,
  ViewStyle,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// ── Role type ─────────────────────────────────────────────────────
type Role = "citizen" | "mla" | "employee";

// ── API response shape ────────────────────────────────────────────
interface LoginResponse {
  user: Record<string, unknown>;
  token: string;
}

interface ApiError {
  message?: string;
}

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  ink: "#030f18",
  muted: "#4b6478",
  mutedLt: "#8fa3b1",
  sky: "#38bdf8",
  sky300: "#7dd3fc",
  skydd: "#0e7490",
  white: "#ffffff",
  teal: "rgba(20,184,166,0.1)",
  tealBorder: "rgba(20,184,166,0.22)",
} as const;

// ── AsyncStorage helpers ──────────────────────────────────────────
const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value);
};

const removeItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

// ── Component ─────────────────────────────────────────────────────
export default function LoginPage(): React.JSX.Element {
  console.log("LOGIN PAGE OPENED");

  const router = useRouter();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<Role | null>(null);
  const [focusedField, setFocusedField] = useState<"id" | "pw" | null>(null);

  useEffect(() => {
    (async () => {
      const selectedRole = await getItem("role");

      // No role chosen yet — send back to role picker
      if (!selectedRole) {
        (router as any).replace("/");
        return;
      }

      setRole(selectedRole as Role | null);

      // Only auto-redirect if BOTH token and user exist (genuine active session)
      // Avoids stale token from a previous role redirecting a fresh login attempt
      const token = await getItem("token");
      const storedUser = await getItem("user");
      if (token && storedUser) {
        (router as any).replace("/");
      }
    })();
  }, []);

  const handleLogin = async (): Promise<void> => {
    // Clear any stale session from a previous role before attempting login
    await removeItem("user");
    await removeItem("token");

    const selectedRole = await getItem("role");

    if (!selectedRole) {
      Alert.alert("Please select a role first");
      (router as any).push("/role");
      return;
    }

    try {
      let endpoint = "";
      let payload: Record<string, string> = {};

      if (selectedRole === "citizen") {
        endpoint = "/auth/login";
        payload = { email: identifier, password };
      } else if (selectedRole === "mla") {
        endpoint = "/auth/mla/login";
        payload = { mlaId: identifier, password };
      } else if (selectedRole === "employee") {
        endpoint = "/auth/employee/login";
        payload = { employeeId: identifier, password };
      }

      const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}${endpoint}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        const { user: userData, token } = response.data;

        if (userData) {
          console.log(userData);
          await setItem("user", JSON.stringify(userData));
          await setItem("role", selectedRole);

          if (!token) {
            Alert.alert("Authentication token missing");
            return;
          }

          await setItem("token", token);

          const redirectAfterLogin = await getItem("redirectAfterLogin");
          if (redirectAfterLogin) {
            await removeItem("redirectAfterLogin");
            (router as any).replace(redirectAfterLogin);
          } else {
            (router as any).replace("/");
          }
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMsg =
        axiosError.response?.data?.message ??
        "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  // ── Derived display values ────────────────────────────────────
  const badgeLabel: string =
    role === "citizen" ? "Citizen Login" :
      role === "mla" ? "MLA Login" :
        role === "employee" ? "Employee Login" : "";

  const idLabel: string =
    role === "citizen" ? "Email Address" :
      role === "mla" ? "MLA ID" :
        role === "employee" ? "Employee ID" : "ID";

  const idPlaceholder: string =
    role === "citizen" ? "Enter your email" :
      role === "mla" ? "Enter your MLA ID" :
        "Enter your Employee ID";

  // ── Render ────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={{ uri: "https://i.postimg.cc/xC3v5cLV/2.png" }}
      style={styles.page}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Overlay tint — position set manually, no absoluteFillObject */}
      <View style={styles.overlay} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Card ─────────────────────────────────────────── */}
          <View style={styles.card}>

            {/* Back link */}
            <TouchableOpacity
              style={styles.backHome}
              onPress={() => (router as any).push("/")}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1e3a5f" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>
                Ente<Text style={styles.logoAccent}>MLA</Text>
              </Text>
              <Text style={styles.h1}>Welcome Back</Text>
              <Text style={styles.subtitle}>Secure Digital Governance Portal</Text>

              {/* Role badge */}
              {/* {badgeLabel ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{badgeLabel}</Text>
                </View>
              ) : null} */}

              {/* Accent bar */}
              {/* <View style={styles.accentBar} /> */}
            </View>

            {/* Form */}
            <View style={styles.form}>

              {/* Identifier field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{idLabel}</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === "id" && styles.inputBoxFocused,
                  ]}
                >
                  <View style={styles.iconWrap}>
                    <Text style={styles.iconText}></Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={idPlaceholder}
                    placeholderTextColor={C.mutedLt}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    keyboardType={role === "citizen" ? "email-address" : "default"}
                    onFocus={() => setFocusedField("id")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === "pw" && styles.inputBoxFocused,
                  ]}
                >
                  <View style={styles.iconWrap}>
                    <Text style={styles.iconText}></Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={C.mutedLt}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("pw")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.showBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showBtnText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login button */}
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                activeOpacity={0.88}
              >
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Register link — citizens only */}
            {role === "citizen" && (
              <View style={styles.registerLink}>
                <Text style={styles.registerText}>
                  Not registered?{" "}
                  <Text
                    style={styles.registerSpan}
                    onPress={() => (router as any).push("/register")}
                  >
                    Register
                  </Text>
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2026 Digital Governance Initiative</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create<{
  flex: ViewStyle;
  page: ViewStyle;
  overlay: ViewStyle;
  scroll: ViewStyle;
  card: ViewStyle;
  backHome: ViewStyle;
  backHomeText: TextStyle;
  header: ViewStyle;
  logo: TextStyle;
  logoAccent: TextStyle;
  h1: TextStyle;
  subtitle: TextStyle;
  roleBadge: ViewStyle;
  roleBadgeText: TextStyle;
  accentBar: ViewStyle;
  form: ViewStyle;
  formGroup: ViewStyle;
  label: TextStyle;
  inputBox: ViewStyle;
  inputBoxFocused: ViewStyle;
  iconWrap: ViewStyle;
  iconText: TextStyle;
  input: TextStyle;
  showBtn: ViewStyle;
  showBtnText: TextStyle;
  loginBtn: ViewStyle;
  loginBtnText: TextStyle;
  registerLink: ViewStyle;
  registerText: TextStyle;
  registerSpan: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
}>({
  flex: { flex: 1 },

  page: { flex: 1 },

  // ✅ Fixed: manual absolute positioning instead of absoluteFillObject spread
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },

  // ── Card ──────────────────────────────────────────────────────
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 8,
  },

  // ── Back link ─────────────────────────────────────────────────
  backHome: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.15)",
    marginBottom: 20,

    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  backHomeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: C.skydd,
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  logoAccent: {
    color: C.skydd,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "300",
    color: C.muted,
    letterSpacing: 0.3,
    marginBottom: 14,
    textAlign: "center",
  },

  // ── Role badge ────────────────────────────────────────────────
  roleBadge: {
    backgroundColor: C.teal,
    borderWidth: 1,
    borderColor: C.tealBorder,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    color: C.skydd,
  },

  accentBar: {
    width: 40,
    height: 3,
    borderRadius: 999,
    backgroundColor: C.sky,
    opacity: 0.7,
    marginTop: 16,
  },

  // ── Form ─────────────────────────────────────────────────────
  form: {
    flexDirection: "column",
  },
  formGroup: {
    flexDirection: "column",
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: C.ink,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // ── Input box ─────────────────────────────────────────────────
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    paddingHorizontal: 16,
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  inputBoxFocused: {
    borderColor: "rgba(20,184,166,0.4)",
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  iconWrap: {
    paddingRight: 8,
    opacity: 0.6,
  },
  iconText: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "300",
    color: C.ink,
    paddingVertical: 13,
    paddingHorizontal: 0,
  },

  // ── Show/Hide button ─────────────────────────────────────────
  showBtn: {
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 2,
  },
  showBtnText: {
    fontSize: 11,
    fontWeight: "500",
    color: C.skydd,
    letterSpacing: 0.8,
  },

  // ── Login button ─────────────────────────────────────────────
  loginBtn: {
    marginTop: 6,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    backgroundColor: C.skydd,
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  // ── Register link ─────────────────────────────────────────────
  registerLink: {
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 13,
    fontWeight: "300",
    color: C.muted,
  },
  registerSpan: {
    color: C.skydd,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "400",
    color: C.mutedLt,
    letterSpacing: 1,
  },

});