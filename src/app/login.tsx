import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "citizen" | "mla" | "employee" | null;

interface UserData {
  _id: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

interface LoginResponse {
  user: UserData;
  token: string;
  message?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<Role>(null);

  // ── Load role & check existing token (replaces localStorage in useEffect) ──
  useEffect(() => {
    const init = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("role");
        const token = await AsyncStorage.getItem("token");

        if (!storedRole) {
            router.replace("/role-select" as any);
          return;
        }

        setRole(storedRole as Role);

        if (token) {
          router.replace("/");
        }
      } catch (e) {
        console.error("Init error:", e);
      }
    };

    init();
  }, []);

  // ── Login Handler ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      const selectedRole = await AsyncStorage.getItem("role");

      if (!selectedRole) {
  Alert.alert("Error", "Please select a role first");
  router.replace("/");
  return;
}

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

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}${endpoint}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        const { user: userData, token } = response.data;

        if (userData) {
          console.log(userData);

          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("role", selectedRole);

          if (!token) {
            Alert.alert("Error", "Authentication token missing");
            return;
          }

          await AsyncStorage.setItem("token", token);

          const redirectAfterLogin = await AsyncStorage.getItem("redirectAfterLogin");

          if (redirectAfterLogin) {
  await AsyncStorage.removeItem("redirectAfterLogin");
  router.replace(redirectAfterLogin as any);
} else {
  router.replace("/");
}
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg =
        err.response?.data?.message ?? "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  // ── Role Badge ────────────────────────────────────────────────────────────
  const renderRoleBadge = () => {
    if (role === "citizen") {
      return (
        <View style={styles.roleBadge}>
          <FontAwesome name="user" size={13} color="#4f46e5" />
          <Text style={styles.roleBadgeText}>Citizen Login</Text>
        </View>
      );
    }
    if (role === "mla") {
      return (
        <View style={styles.roleBadge}>
          <FontAwesome name="bank" size={13} color="#4f46e5" />
          <Text style={styles.roleBadgeText}>MLA Login</Text>
        </View>
      );
    }
    if (role === "employee") {
      return (
        <View style={styles.roleBadge}>
          <MaterialIcons name="build" size={13} color="#4f46e5" />
          <Text style={styles.roleBadgeText}>Employee Login</Text>
        </View>
      );
    }
    return null;
  };

  // ── Label & Placeholder per role ──────────────────────────────────────────
  const identifierLabel =
    role === "citizen"
      ? "Email Address"
      : role === "mla"
      ? "MLA ID"
      : "Employee ID";

  const identifierPlaceholder =
    role === "citizen"
      ? "Enter your email"
      : role === "mla"
      ? "Enter your MLA ID"
      : "Enter your Employee ID";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.loginPage}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginCard}>

          {/* Back to Home */}
          <TouchableOpacity
  style={styles.backHome}
  onPress={() => router.replace("/")}
>
          
            <Text style={styles.backHomeText}>← Back to Home</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.loginHeader}>
            <Text style={styles.logo}>
              Ente<Text style={styles.logoHighlight}>MLA</Text>
            </Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Secure Digital Governance Portal</Text>
            {renderRoleBadge()}
          </View>

          {/* Identifier Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{identifierLabel}</Text>
            <View style={styles.inputBox}>
              <FontAwesome name="envelope" size={14} color="#030f18" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={identifierPlaceholder}
                placeholderTextColor="#aaa"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType={role === "citizen" ? "email-address" : "default"}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <FontAwesome name="lock" size={14} color="#030f18" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showBtnText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Sign In →</Text>
          </TouchableOpacity>

          {/* Register Link — Citizens only */}
          {role === "citizen" && (
            <View style={styles.registerLink}>
              <Text style={styles.registerText}>
                Not registered?{" "}
                <Text
                  style={styles.registerAnchor}
                  onPress={() => router.push("/register")}
                >
                  Register
                </Text>
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>© 2026 Digital Governance Initiative</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loginPage: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  // ── Back Button
  backHome: {
    marginBottom: 16,
  },
  backHomeText: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "600",
  },

  // ── Header
  loginHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  logoHighlight: {
    color: "#4f46e5",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
  },

  // ── Role Badge
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  roleBadgeText: {
    fontSize: 13,
    color: "#4f46e5",
    fontWeight: "600",
    marginLeft: 6,
  },

  // ── Form
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  showBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  showBtnText: {
    fontSize: 13,
    color: "#4f46e5",
    fontWeight: "600",
  },

  // ── Login Button
  loginBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Register Link
  registerLink: {
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerAnchor: {
    color: "#4f46e5",
    fontWeight: "700",
  },

  // ── Footer
  loginFooter: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#bbb",
  },
});