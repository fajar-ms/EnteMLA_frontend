import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";


// ─── Component ────────────────────────────────────────────────────────────────
type Role = "citizen" | "mla" | "employee";
export default function RoleSelect() {

  const selectRole = async (role: Role) => {
  await AsyncStorage.setItem("role", role);
  router.push("/login");
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        {/* Header */}
        <Text style={styles.logo}>
          Ente<Text style={styles.logoHighlight}>MLA</Text>
        </Text>
        <Text style={styles.heading}>Select Your Role</Text>
        <Text style={styles.subheading}>
          Choose how you want to sign in
        </Text>

        {/* Role Buttons */}
        <TouchableOpacity
          style={styles.roleBtn}
          onPress={() => selectRole("citizen")}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: "#eef2ff" }]}>
            <FontAwesome name="user" size={20} color="#4f46e5" />
          </View>
          <View style={styles.roleLabelBox}>
            <Text style={styles.roleName}>Citizen</Text>
            <Text style={styles.roleDesc}>File & track public complaints</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleBtn}
          onPress={() => selectRole("mla")}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: "#fef3c7" }]}>
            <FontAwesome name="bank" size={20} color="#d97706" />
          </View>
          <View style={styles.roleLabelBox}>
            <Text style={styles.roleName}>MLA</Text>
            <Text style={styles.roleDesc}>Manage constituency issues</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleBtn}
          onPress={() => selectRole("employee")}
          activeOpacity={0.85}
        >
          <View style={[styles.iconBox, { backgroundColor: "#d1fae5" }]}>
            <MaterialIcons name="build" size={20} color="#059669" />
          </View>
          <View style={styles.roleLabelBox}>
            <Text style={styles.roleName}>Employee</Text>
            <Text style={styles.roleDesc}>Handle assigned complaints</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>© 2026 Digital Governance Initiative</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
  },

  // ── Header
  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  logoHighlight: {
    color: "#4f46e5",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: "#888",
    marginBottom: 28,
  },

  // ── Role Button
  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#e8e8f0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  roleLabelBox: {
    flex: 1,
  },
  roleName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: "#888",
  },

  // ── Footer
  footer: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 16,
  },
});