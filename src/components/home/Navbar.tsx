// src/components/home/Navbar.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, SafeAreaView, useWindowDimensions, Platform,
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

const Navbar = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { i18n } = useTranslation();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen,    setLangOpen]    = useState(false);
  const [authOpen,    setAuthOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user,        setUser]        = useState<any>(null);
  const [role,        setRole]        = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState('EN');

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

  const handleLanguageChange = async (code: string) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('i18nextLng', code);
    setSelectedLang(code === 'ml' ? 'ML' : 'EN');
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['user', 'role', 'token']);
    setUser(null); setRole(null);
    setProfileOpen(false); setMobileMenuOpen(false);
    router.replace('/');
  };

  const handleDashboard = () => {
    setMobileMenuOpen(false);
    if (role === 'citizen')  router.push('/citizendashboard' as Href);
    else if (role === 'mla') router.push('/mladashboard' as Href);
    else                     router.push('/employedashboard' as Href);
  };

  const displayName  = user?.name || user?.employee_name || user?.emp_name || 'User';
  const displayEmail = user?.email || user?.employee_email || user?.email_id || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ══ ROW 1: Logo  +  (desktop: nav links + actions)  +  (mobile: hamburger) ══ */}
        <View style={styles.row1}>

          {/* Logo */}
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.logo}>
              Ente<Text style={styles.logoAccent}>MLA</Text>
            </Text>
          </TouchableOpacity>

          {/* Desktop centre links */}
          {!isMobile && (
            <View style={styles.navLinks}>
              {NAV_LINKS.map((l) => (
                <TouchableOpacity key={l.label} onPress={() => router.push(l.route)}>
                  <Text style={styles.navText}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Desktop right actions */}
          {!isMobile && (
            <View style={styles.desktopRight}>
              <TouchableOpacity style={styles.langBtn} onPress={() => setLangOpen(true)}>
                <Ionicons name="globe-outline" size={14} color="#0f766e" />
                <Text style={styles.langText}>{selectedLang}</Text>
                <Ionicons name="chevron-down" size={13} color="#0f766e" />
              </TouchableOpacity>

              {!user ? (
                <View style={styles.authRow}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setAuthOpen(true)}>
                    <Text style={styles.btnTextWhite}>Login</Text>
                    <Ionicons name="chevron-down" size={13} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/register' as Href)}>
                    <Text style={styles.outlineBtnText}>Register</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.authRow}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleDashboard}>
                    <Text style={styles.btnTextWhite}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.avatarBtn} onPress={() => setProfileOpen(true)}>
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person" size={16} color="#fff" />
                    </View>
                    <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
                    <Ionicons name="chevron-down" size={13} color="#0c2f47" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <TouchableOpacity
              style={styles.hamburger}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Ionicons
                name={mobileMenuOpen ? 'close' : 'menu'}
                size={26}
                color="#0c2f47"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ══ ROW 2 (mobile only): Lang  Login  Register — always full text, never overflows ══ */}
        {isMobile && (
          <View style={styles.row2}>
            {/* Language */}
            <TouchableOpacity style={styles.langBtn} onPress={() => setLangOpen(true)}>
              <Ionicons name="globe-outline" size={13} color="#0f766e" />
              <Text style={styles.langText}>{selectedLang}</Text>
              <Ionicons name="chevron-down" size={12} color="#0f766e" />
            </TouchableOpacity>

            {!user ? (
              <View style={styles.authRowMobile}>
                {/* Login */}
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setAuthOpen(true)}>
                  <Text style={styles.btnTextWhite}>Login</Text>
                  <Ionicons name="chevron-down" size={12} color="#fff" />
                </TouchableOpacity>

                {/* Register — flex so it fills remaining space */}
                <TouchableOpacity
                  style={[styles.outlineBtn, styles.outlineBtnGrow]}
                  onPress={() => router.push('/register' as Href)}
                >
                  <Text style={styles.outlineBtnText}>Register</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authRowMobile}>
                <TouchableOpacity style={[styles.primaryBtn, styles.primaryBtnGrow]} onPress={handleDashboard}>
                  <Text style={styles.btnTextWhite}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatarBtn} onPress={() => setProfileOpen(true)}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={15} color="#fff" />
                  </View>
                  <Ionicons name="chevron-down" size={12} color="#0c2f47" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ══ Mobile slide-down menu ══ */}
      {isMobile && mobileMenuOpen && (
        <View style={styles.mobileMenu}>
          {user && (
            <TouchableOpacity style={styles.mobileMenuDashRow} onPress={handleDashboard}>
              <Ionicons name="grid-outline" size={18} color="#0f766e" />
              <Text style={styles.mobileMenuDashText}>Dashboard</Text>
            </TouchableOpacity>
          )}
          {NAV_LINKS.map((l) => (
            <TouchableOpacity
              key={l.label}
              style={styles.mobileMenuRow}
              onPress={() => { setMobileMenuOpen(false); router.push(l.route); }}
            >
              <Text style={styles.mobileMenuText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ══ Language modal ══ */}
      <Modal visible={langOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Language</Text>
            {[{ code: 'en', label: 'English' }, { code: 'ml', label: 'Malayalam' }].map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[styles.dropdownRow, selectedLang === opt.code.toUpperCase() && styles.dropdownRowActive]}
                onPress={() => handleLanguageChange(opt.code)}
              >
                <Text style={[styles.dropdownRowText, selectedLang === opt.code.toUpperCase() && styles.dropdownRowTextActive]}>
                  {opt.label}
                </Text>
                {selectedLang === opt.code.toUpperCase() && (
                  <Ionicons name="checkmark" size={16} color="#0f766e" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══ Login modal ══ */}
      <Modal visible={authOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAuthOpen(false)}>
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Login as</Text>
            {['citizen', 'mla', 'employee'].map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.dropdownRow}
                onPress={() => { AsyncStorage.setItem('role', r); setAuthOpen(false); router.push('/login' as Href); }}
              >
                <Text style={styles.dropdownRowText}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                <Ionicons name="arrow-forward" size={15} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══ Profile modal ══ */}
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
    </SafeAreaView>
  );
};

// ──────────────────────────────────────────
//  STYLES
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    zIndex: 1000,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },

  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(20,184,166,0.25)',
  },

  /* ── Row 1: Logo + nav/hamburger ── */
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },

  /* ── Row 2 (mobile): Lang + Login + Register ── */
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },

  /* Logo */
  logo:       { fontSize: 22, fontWeight: '900', color: '#0c2f47' },
  logoAccent: { color: '#14b8a6' },

  /* Desktop nav */
  navLinks: { flexDirection: 'row', gap: 24, flex: 1, justifyContent: 'center' },
  navText:  { fontSize: 15, fontWeight: '600', color: '#475569' },

  /* Desktop right */
  desktopRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  /* Language pill */
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf9',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.35)',
  },
  langText: { fontSize: 12, fontWeight: '700', color: '#0f766e' },

  /* Auth rows */
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  /* Mobile auth: fills remaining width after lang pill */
  authRowMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0f766e',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  primaryBtnGrow: { flex: 1, justifyContent: 'center' },
  btnTextWhite: { color: '#fff', fontSize: 13, fontWeight: '700' },

  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0f766e',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  outlineBtnGrow: { flex: 1 },
  outlineBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Avatar / profile button */
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.35)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#f0fdf9',
  },
  avatarCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#14b8a6',
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 13, fontWeight: '600', color: '#0c2f47', maxWidth: 80 },

  /* Hamburger */
  hamburger: { padding: 2 },

  /* ── Mobile menu ── */
  mobileMenu: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    ...Platform.select({ android: { elevation: 4 } }),
  },
  mobileMenuDashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f0fdf9',
  },
  mobileMenuDashText: { fontSize: 15, fontWeight: '700', color: '#0f766e' },
  mobileMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  mobileMenuText: { fontSize: 15, fontWeight: '500', color: '#1e3a5f' },

  /* ── Modal backdrop ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Dropdown card */
  dropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 230,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  dropdownTitle: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  dropdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8,
  },
  dropdownRowActive:     { backgroundColor: '#f0fdf9' },
  dropdownRowText:       { fontSize: 15, color: '#1e3a5f', fontWeight: '500' },
  dropdownRowTextActive: { color: '#0f766e', fontWeight: '700' },

  /* Profile card */
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 280,
    alignItems: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
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