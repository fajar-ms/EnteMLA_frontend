import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAV_LINKS: { label: string; route: Href }[] = [
  { label: 'Home',       route: '/' },
  { label: 'About',      route: '/about' },
  { label: 'Complaints', route: '/login' },
  { label: 'Q/A',        route: '/qa' },
  { label: 'Contact',    route: '/contact' },
];

const DRAWER_WIDTH = 270;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Navbar = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user,  setUser]              = useState<any>(null);
  const [role,  setRole]              = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState('EN');

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      const r = await AsyncStorage.getItem('role');
      const l = await AsyncStorage.getItem('i18nextLng');
      if (u) setUser(JSON.parse(u));
      if (r) setRole(r);
      if (l) setSelectedLang(l === 'ml' ? 'ML' : 'EN');
    })();
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,             duration: 220, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const handleLanguageChange = async (code: string) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('i18nextLng', code);
    setSelectedLang(code === 'ml' ? 'ML' : 'EN');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['user', 'role', 'token']);
    setUser(null);
    setRole(null);
    setProfileOpen(false);
    closeDrawer();
    router.replace('/');
  };

  const handleDashboard = () => {
    closeDrawer();
    if (role === 'citizen')       router.push('/citizendashboard' as Href);
    else if (role === 'mla')      router.push('/mladashboard' as Href);
    else                          router.push('/employedashboard' as Href);
  };

  const displayName  = user?.name || user?.employee_name || user?.emp_name || 'User';
  const displayEmail = user?.email || user?.employee_email || user?.email_id || '';

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>

          {/* Left: Hamburger + Logo */}
          <View style={styles.navLeft}>
            <TouchableOpacity style={styles.hamburger} onPress={openDrawer}>
              <Ionicons name="menu" size={22} color="#0c2f47" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.logo}>
                Ente<Text style={styles.logoAccent}>MLA</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right: Avatar or Login */}
          {user ? (
            <TouchableOpacity style={styles.avatarCircle} onPress={() => setProfileOpen(true)}>
              <Ionicons name="person" size={17} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={async () => {
                await AsyncStorage.setItem('role', 'citizen');
                router.push('/login' as Href);
              }}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Drawer */}
      {drawerOpen && (
        <Modal visible transparent animationType="none" onRequestClose={closeDrawer}>
          <View style={styles.drawerContainer}>

            {/* Dim overlay */}
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeDrawer} />
            </Animated.View>

            {/* Sliding panel */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

              {/* Drawer header */}
              <SafeAreaView style={styles.drawerSafeArea}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.logo}>
                    Ente<Text style={styles.logoAccent}>MLA</Text>
                  </Text>
                  <TouchableOpacity onPress={closeDrawer}>
                    <Ionicons name="close" size={22} color="#0c2f47" />
                  </TouchableOpacity>
                </View>

                {/* Nav Links */}
                <Text style={styles.sectionLabel}>Navigation</Text>
                {NAV_LINKS.map((l) => (
                  <TouchableOpacity
                    key={l.label}
                    style={styles.drawerRow}
                    onPress={() => { closeDrawer(); router.push(l.route); }}
                  >
                    <Text style={styles.drawerRowText}>{l.label}</Text>
                    <Ionicons name="chevron-forward" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                ))}

                {/* Dashboard — only when logged in */}
                {user && (
                  <>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <TouchableOpacity style={styles.drawerRow} onPress={handleDashboard}>
                      <View style={styles.drawerRowLeft}>
                        <Ionicons name="grid-outline" size={16} color="#0f766e" />
                        <Text style={[styles.drawerRowText, styles.drawerRowTextAccent]}>
                          Dashboard
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color="#94a3b8" />
                    </TouchableOpacity>
                  </>
                )}

                {/* Language */}
                <Text style={styles.sectionLabel}>Language</Text>
                <View style={styles.langRow}>
                  <Ionicons name="globe-outline" size={15} color="#0f766e" />
                  {[{ code: 'en', label: 'EN' }, { code: 'ml', label: 'ML' }].map((opt) => (
                    <TouchableOpacity
                      key={opt.code}
                      style={[
                        styles.langPill,
                        selectedLang === opt.label && styles.langPillActive,
                      ]}
                      onPress={() => handleLanguageChange(opt.code)}
                    >
                      <Text
                        style={[
                          styles.langPillText,
                          selectedLang === opt.label && styles.langPillTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Profile Modal */}
      <Modal visible={profileOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setProfileOpen(false)}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatarLarge}>
              <Ionicons name="person" size={28} color="#fff" />
            </View>
            <Text style={styles.profileCardName}>{displayName}</Text>
            <Text style={styles.profileCardEmail}>{displayEmail}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{role?.toUpperCase()}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.dashBtnFull}
              onPress={() => { setProfileOpen(false); handleDashboard(); }}
            >
              <Ionicons name="grid-outline" size={15} color="#fff" />
              <Text style={styles.dashBtnFullText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={15} color="#ef4444" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    zIndex: 1000,
  },

  navbar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottomWidth: 1.5,
  borderBottomColor: 'rgba(20,184,166,0.25)',
  paddingHorizontal: 16,
  paddingVertical: 10,
  paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10,
},

  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  hamburger: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo:       { fontSize: 20, fontWeight: '900', color: '#0c2f47' },
  logoAccent: { color: '#14b8a6' },

  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#14b8a6',
    alignItems: 'center', justifyContent: 'center',
  },

  loginBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Drawer
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  drawerSafeArea: { flex: 1 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
  },

  drawerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#f8fafc',
  },
  drawerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerRowText:       { fontSize: 15, color: '#1e3a5f', fontWeight: '500' },
  drawerRowTextAccent: { color: '#0f766e', fontWeight: '700' },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#f8fafc',
  },
  langPill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  langPillActive:     { backgroundColor: '#f0fdf9', borderColor: 'rgba(20,184,166,0.4)' },
  langPillText:       { fontSize: 12, fontWeight: '700', color: '#475569' },
  langPillTextActive: { color: '#0f766e' },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  profileAvatarLarge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#14b8a6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  profileCardName:  { fontSize: 17, fontWeight: '800', color: '#0c2f47', textAlign: 'center', marginBottom: 4 },
  profileCardEmail: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 10 },
  roleBadge: {
    backgroundColor: '#f0fdf9', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#0f766e', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#f1f5f9', width: '100%', marginBottom: 16 },
  dashBtnFull: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0f766e', borderRadius: 10,
    paddingVertical: 11, width: '100%', justifyContent: 'center', marginBottom: 10,
  },
  dashBtnFullText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 10,
    paddingVertical: 11, width: '100%', justifyContent: 'center',
  },
  logoutBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});

export default Navbar;