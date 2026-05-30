// src/components/home/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [selectedLang, setSelectedLang] = useState('English');

    // Load user & role
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            const storedRole = await AsyncStorage.getItem('role');
            if (storedUser) setUser(JSON.parse(storedUser));
            if (storedRole) setRole(storedRole);
        };
        loadUser();
    }, []);

    const handleLanguageChange = async (langCode: string) => {
        await i18n.changeLanguage(langCode);
        await AsyncStorage.setItem('i18nextLng', langCode);
        setSelectedLang(langCode === 'en' ? 'English' : langCode === 'ml' ? 'Malayalam' : 'Hindi');
        setLangOpen(false);
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['user', 'role', 'token']);
        setUser(null);
        setRole(null);
        setProfileOpen(false);
        router.replace('/');
    };

    /*const handleDashboard = () => {
        if (role === 'citizen') router.push('/citizen');
        else if (role === 'mla') router.push('/mla');
        else if (role === 'employee') router.push('/employee');
    };*/

    return (
        <View style={styles.navbar}>
            <View style={styles.container}>
                {/* Logo */}
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Text style={styles.logo}>
                        Ente<Text style={styles.logoSpan}>MLA</Text>
                    </Text>
                </TouchableOpacity>

                {/* Desktop Navigation */}
                {width > 768 && (
                    <View style={styles.navLinks}>
                        <TouchableOpacity onPress={() => router.push('/')} style={styles.navItem}>
                            <Text style={styles.navText}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/about')} style={styles.navItem}>
                            <Text style={styles.navText}>About</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/complaints')} style={styles.navItem}>
                            <Text style={styles.navText}>Complaints</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/qa')} style={styles.navItem}>
                            <Text style={styles.navText}>Q/A</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/contact')} style={styles.navItem}>
                            <Text style={styles.navText}>Contact</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {/* Language Selector */}
                    <View style={styles.dropdownWrapper}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setLangOpen(!langOpen)}>
                            <Text style={styles.btnText}>{selectedLang}</Text>
                            <Ionicons name="chevron-down" size={16} color="#0c2f47" />
                        </TouchableOpacity>

                        <Modal visible={langOpen} transparent animationType="fade">
                            <TouchableOpacity style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
                                <View style={styles.dropdownMenu}>
                                    <TouchableOpacity onPress={() => handleLanguageChange('en')}>
                                        <Text style={styles.menuItem}>English</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleLanguageChange('ml')}>
                                        <Text style={styles.menuItem}>Malayalam</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>

                    {!user ? (
                        <>
                            {/* Login Dropdown */}
                            <View style={styles.dropdownWrapper}>
                                <TouchableOpacity style={styles.primaryBtn} onPress={() => setAuthOpen(!authOpen)}>
                                    <Text style={styles.btnTextWhite}>Login</Text>
                                    <Ionicons name="chevron-down" size={16} color="white" />
                                </TouchableOpacity>

                                <Modal visible={authOpen} transparent>
                                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setAuthOpen(false)}>
                                        <View style={styles.dropdownMenu}>
                                            <TouchableOpacity onPress={() => { AsyncStorage.setItem('role', 'citizen'); router.push('/login'); }}>
                                                <Text style={styles.menuItem}>Citizen</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { AsyncStorage.setItem('role', 'mla'); router.push('/login'); }}>
                                                <Text style={styles.menuItem}>MLA</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { AsyncStorage.setItem('role', 'employee'); router.push('/login'); }}>
                                                <Text style={styles.menuItem}>Employee</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            </View>

                            {/* Register */}
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/register')}>
                                <Text style={styles.btnTextWhite}>Register</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.profileWrapper}>
                          {/*  <TouchableOpacity style={styles.primaryBtn} onPress={handleDashboard}>
                                <Text style={styles.btnTextWhite}>Dashboard</Text>
                            </TouchableOpacity>
*/}
                            <TouchableOpacity style={styles.profileBtn} onPress={() => setProfileOpen(!profileOpen)}>
                                <View style={styles.profileIcon}>
                                    <Ionicons name="person" size={22} color="white" />
                                </View>
                                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                            </TouchableOpacity>

                            <Modal visible={profileOpen} transparent animationType="fade">
                                <TouchableOpacity style={styles.modalOverlay} onPress={() => setProfileOpen(false)}>
                                    <View style={styles.profileDropdown}>
                                        <View style={styles.profileInfo}>
                                            <Text style={styles.profileNameBig}>{user?.name}</Text>
                                            <Text style={styles.profileEmail}>{user?.email}</Text>
                                            <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                                            <Text style={styles.logoutText}>Logout</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        </View>
                    )}

                    {/* Mobile Menu Button */}
                    {width <= 768 && (
                        <TouchableOpacity onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <Ionicons name={mobileMenuOpen ? "close" : "menu"} size={28} color="#0c2f47" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Mobile Menu */}
            {mobileMenuOpen && width <= 768 && (
                <View style={styles.mobileMenu}>
                    {['Home', 'About', 'Complaints', 'Q/A', 'Contact'].map((item) => (
                        <TouchableOpacity key={item} style={styles.mobileMenuItem}>
                            <Text style={styles.mobileMenuText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(20,184,166,0.3)',
        zIndex: 1000,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 70,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0c2f47',
    },
    logoSpan: {
        color: '#14b8a6',
    },
    navLinks: {
        flexDirection: 'row',
        gap: 24,
    },
    navItem: {
        paddingVertical: 8,
    },
    navText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f0feff',
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.4)',
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#14b8a6',
        borderRadius: 30,
    },
    btnText: { fontWeight: '600', color: '#0c2f47' },
    btnTextWhite: { fontWeight: '600', color: 'white' },
    profileWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f0feff',
        padding: 6,
        paddingRight: 14,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.4)',
    },
    profileIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#14b8a6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: { fontWeight: '600', color: '#0c2f47' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 80,
        paddingRight: 20,
    },
    dropdownMenu: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 8,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        elevation: 10,
    },
    dropdownWrapper: {
        position: 'relative',
    },
    menuItem: {
        padding: 14,
        fontSize: 16,
        fontWeight: '500',
        color: '#0c2f47',
    },
    profileDropdown: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: 260,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        elevation: 15,
    },
    profileInfo: { marginBottom: 12 },
    profileNameBig: { fontSize: 16, fontWeight: '700' },
    profileEmail: { fontSize: 14, color: '#0369a1' },
    roleText: { color: '#14b8a6', fontWeight: '700', marginTop: 4 },
    logoutBtn: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutText: { color: '#ef4444', fontWeight: '600' },
    mobileMenu: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    mobileMenuItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    mobileMenuText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Navbar;