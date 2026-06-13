import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

// ✅ Values are lowercase to match LoginPage role comparisons ("citizen" | "mla" | "employee")
const roles: { label: string; value: string }[] = [
  { label: "Citizen",  value: "citizen"  },
  { label: "MLA",      value: "mla"      },
  { label: "Employee", value: "employee" },
];

interface Props {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

export default function RoleSelector({ selectedRole, setSelectedRole }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.roleContainer}
    >
      {roles.map((role) => (
        <TouchableOpacity
          key={role.value}
          style={[
            styles.roleCard,
            selectedRole === role.value && styles.activeRoleCard,
          ]}
          onPress={() => setSelectedRole(role.value)}  // saves "citizen" / "mla" / "employee"
          activeOpacity={0.8}
        >
          <Text style={styles.roleName}>{role.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  roleContainer: {
    alignItems: "center",
    gap: 15,
    paddingBottom: 5,
    marginTop: 20,
  },

  roleCard: {
    minWidth: 90,
    height: 90,

    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#5a3a1b",

    backgroundColor: "#8b5a2b",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 5,
  },

  activeRoleCard: {
    borderColor: "#ffd700",
    backgroundColor: "#c68642",
    transform: [{ scale: 1.05 }],
  },

  roleName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});