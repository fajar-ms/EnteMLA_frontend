import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

// ── Icons (using text fallback — install react-native-vector-icons for real icons) ──
const MenuIcon = () => <Text style={{ fontSize: 24, color: "#0c2f47" }}>☰</Text>;
const CloseIcon = () => <Text style={{ fontSize: 24, color: "#0c2f47" }}>✕</Text>;
const UserIcon = () => <Text style={{ fontSize: 20, color: "#fff" }}>👤</Text>;
const ArrowDown = () => <Text style={{ fontSize: 10, color: "inherit" }}>▼</Text>;

const Navbar = () => {

  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const langNames: Record<string, string> = {
    en: "English",
    ml: "Malayalam",
    hi: "Hindi",
  };

  // ── Load from AsyncStorage on mount ──
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("role");
        const storedUser = await AsyncStorage.getItem("user");
        const storedLang = await AsyncStorage.getItem("i18nextLng") || "en";

        setRole(storedRole);
        setSelectedLang(langNames[storedLang] || "English");

        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log("AsyncStorage error:", e);
      }
    };
    loadStorage();
  }, []);

  const handleDashboard = () => {
    if (role === "citizen") navigation.navigate("Citizen");
    else if (role === "mla") navigation.navigate("MLA");
    else if (role === "employee") navigation.navigate("Employee");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("token");
    setRole(null);
    setUserData(null);
    navigation.navigate("Home");
  };

  const handleLanguageChange = async (langCode: string) => {
    const langMap: Record<string, string> = {
      en: "English",
      ml: "Malayalam",
      hi: "Hindi",
    };
    const label = langMap[langCode] || "English";
    setSelectedLang(label);
    await AsyncStorage.setItem("i18nextLng", langCode);
    setLangOpen(false);
  };

  const handleLoginRole = async (selectedRole: string) => {
    await AsyncStorage.setItem("role", selectedRole);
    setAuthOpen(false);
    router.push("/login");
  };

  const handleRegisterRole = async (selectedRole: string) => {
    await AsyncStorage.setItem("role", selectedRole);
    setRegisterOpen(false);
    router.push("/register");
  };

  const navLinks = [
    { label: "Home", route: "Home" },
    { label: "About", route: "About" },
    { label: "Complaints", route: "Complaint" },
    { label: "Q/A", route: "QA" },
    { label: "Contact", route: "Contact" },
  ];

  return (
    <View style={styles.navbar}>
      <View style={styles.navbarContainer}>
        {/* LOGO */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.logo}>
            Ente<Text style={styles.logoSpan}>MLA</Text>
          </Text>
        </TouchableOpacity>

        {/* MOBILE MENU BUTTON */}
        <TouchableOpacity
          style={styles.mobileMenuBtn}
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </TouchableOpacity>
      </View>

      {/* MOBILE NAV LINKS */}
      {mobileMenuOpen && (
        <View style={styles.navLinks}>
          {navLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.navItem}
              onPress={() => {
                setMobileMenuOpen(false);
                navigation.navigate(link.route as any);
              }}
            >
              <Text style={styles.navItemText}>{link.label}</Text>
            </TouchableOpacity>
          ))}

          {/* RIGHT SECTION */}
          <View style={styles.rightSection}>
            {/* Language Selector */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setLangOpen(!langOpen)}
            >
              <Text style={styles.secondaryBtnText}>
                {selectedLang} ▼
              </Text>
            </TouchableOpacity>

            {langOpen && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleLanguageChange("en")}
                >
                  <Text style={styles.dropdownItemText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleLanguageChange("ml")}
                >
                  <Text style={styles.dropdownItemText}>Malayalam</Text>
                </TouchableOpacity>
              </View>
            )}

            {!userData ? (
              <>
                {/* Login */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    setAuthOpen(!authOpen);
                    setRegisterOpen(false);
                  }}
                >
                  <Text style={styles.primaryBtnText}>Login ▼</Text>
                </TouchableOpacity>

                {authOpen && (
                  <View style={styles.dropdownMenu}>
                    {["citizen", "mla", "employee"].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.dropdownItem}
                        onPress={() => handleLoginRole(r)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Register */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    setRegisterOpen(!registerOpen);
                    setAuthOpen(false);
                  }}
                >
                  <Text style={styles.primaryBtnText}>Register ▼</Text>
                </TouchableOpacity>

                {registerOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleRegisterRole("citizen")}
                    >
                      <Text style={styles.dropdownItemText}>Citizen</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              /* LOGGED IN */
              <View style={styles.profileWrapper}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleDashboard}
                >
                  <Text style={styles.primaryBtnText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() => setProfileOpen(!profileOpen)}
                >
                  <View style={styles.profileIcon}>
                    <UserIcon />
                  </View>
                  <Text style={styles.profileName}>
                    {userData?.name ||
                     userData?.employee_name ||
                     userData?.emp_name ||
                     "User"}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#0c2f47" }}> ▼</Text>
                </TouchableOpacity>

                {profileOpen && (
                  <View style={styles.profileDropdown}>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileInfoName}>
                        {userData?.name ||
                         userData?.employee_name ||
                         userData?.emp_name ||
                         "User"}
                      </Text>
                      <Text style={styles.profileInfoEmail}>
                        {userData?.email ||
                         userData?.employee_email ||
                         userData?.email_id ||
                         ""}
                      </Text>
                      <Text style={styles.roleText}>
                        {role?.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.logoutBtn}
                      onPress={handleLogout}
                    >
                      <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// ──────────────────────────────────────────
//  STYLES
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  navbar: {
    position: "relative",
    zIndex: 2000,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(176,255,255,0.4)",
    shadowColor: "rgba(20,184,166,0.08)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },

  navbarContainer: {
    paddingHorizontal: "5%",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0c2f47",
    letterSpacing: -1,
  },

  logoSpan: {
    color: "#14b8a6",
    fontWeight: "800",
    fontSize: 27,
  },

  mobileMenuBtn: {
    padding: 4,
  },

  navLinks: {
    backgroundColor: "rgba(255,255,255,0.98)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20,184,166,0.1)",
  },

  navItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20,184,166,0.08)",
  },

  navItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
  },

  rightSection: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },

  secondaryBtn: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(176,255,255,0.5)",
    alignSelf: "flex-start",
    marginBottom: 8,
  },

  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0c2f47",
    letterSpacing: 0.3,
  },

  primaryBtn: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: "#14b8a6",
    alignSelf: "flex-start",
    marginBottom: 8,
    shadowColor: "rgba(20,184,166,0.3)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },

  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.4,
  },

  dropdownMenu: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(176,255,255,0.6)",
    shadowColor: "rgba(20,184,166,0.12)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
    marginBottom: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20,184,166,0.06)",
  },

  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0c2f47",
    letterSpacing: 0.3,
  },

  profileWrapper: {
    position: "relative",
  },

  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(176,255,255,0.5)",
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    marginBottom: 8,
  },

  profileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#14b8a6",
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    fontWeight: "700",
    color: "#0c2f47",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  profileDropdown: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(176,255,255,0.6)",
    padding: 18,
    shadowColor: "rgba(20,184,166,0.12)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
    marginBottom: 8,
  },

  profileInfo: {
    marginBottom: 12,
  },

  profileInfoName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0c2f47",
    marginBottom: 4,
  },

  profileInfoEmail: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "600",
    marginBottom: 4,
  },

  roleText: {
    color: "#14b8a6",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(20,184,166,0.3)",
    marginVertical: 12,
  },

  logoutBtn: {
    borderWidth: 2,
    borderColor: "rgba(20,184,166,0.2)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  logoutBtnText: {
    fontWeight: "700",
    color: "#0c2f47",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default Navbar;