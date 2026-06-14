// src/app/contact.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/home/Navbar';

// Import your data (create these files if needed)
import constituencies from '../constants/constituencies';
import departments from '../constants/departments';

const { width } = Dimensions.get('window');

const Contact = () => {
    const { t } = useTranslation();

    const [selected, setSelected] = useState(constituencies[0]);
    const [search, setSearch] = useState("");
    const [showAll, setShowAll] = useState(false);

    const filteredConstituencies = constituencies.filter((item) =>
        item.constituency.toLowerCase().includes(search.toLowerCase())
    );

    return (
    <ImageBackground
        source={{ uri: "https://i.postimg.cc/xC3v5cLV/2.png" }}
        style={styles.container}
        resizeMode="cover"
    >
        <View style={styles.overlay} />

        <Navbar />

        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>{t("contact_hero_title")}</Text>
                    <Text style={styles.heroSubtitle}>{t("contact_hero_desc")}</Text>
                </View>

                <View style={styles.directoryLayout}>
                    {/* Left Sidebar - Constituencies */}
                    <View style={styles.sidebar}>
                        <View style={styles.sidebarHeader}>
                            <Text style={styles.sidebarTitle}>{t("constituencies")}</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t("search_constituency")}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <ScrollView style={styles.constituencyList}>
                            {(showAll ? filteredConstituencies : filteredConstituencies.slice(0, 8)).map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.constituencyItem,
                                        selected.id === item.id && styles.activeItem
                                    ]}
                                    onPress={() => setSelected(item)}
                                >
                                    <Ionicons name="business" size={18} color="#14b8a6" />
                                    <Text style={styles.constituencyText}>{item.constituency}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {filteredConstituencies.length > 8 && (
                            <TouchableOpacity
                                style={styles.showMoreBtn}
                                onPress={() => setShowAll(!showAll)}
                            >
                                <Text style={styles.showMoreText}>
                                    {showAll ? t("show_less") : t("show_more")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Right Content */}
                    <View style={styles.detailsSection}>
                        {/* MLA Card */}
                        <View style={styles.mlaCard}>
                            <View style={styles.mlaHeader}>
                                <View style={styles.mlaIconWrapper}>
                                    <Ionicons name="person" size={32} color="white" />
                                </View>
                                <Text style={styles.mlaTitle}>{selected.constituency}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>{t("mla")}:</Text>
                                <Text style={styles.value}>{selected.mla.name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>{t("office")}:</Text>
                                <Text style={styles.value}>{selected.mla.location}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>{t("phone")}:</Text>
                                <Text style={styles.value}>{selected.mla.phone}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>{t("email")}:</Text>
                                <Text style={styles.value}>{selected.mla.email}</Text>
                            </View>
                        </View>

                        {/* Departments */}
                        <Text style={styles.deptTitle}>
                            <Ionicons name="business" size={24} color="#14b8a6" /> {t("government_departments")}
                        </Text>

                        <View style={styles.deptGrid}>
                            {(departments[selected.district] || []).map((dept, index) => (
                                <View key={index} style={styles.deptCard}>
                                    <Text style={styles.deptName}>{dept.title}</Text>

                                    <View style={styles.deptInfo}>
                                        <Ionicons name="location" size={16} color="#14b8a6" />
                                        <Text style={styles.deptText}>{dept.location}</Text>
                                    </View>

                                    <View style={styles.deptInfo}>
                                        <Ionicons name="call" size={16} color="#14b8a6" />
                                        <Text style={styles.deptText}>{dept.phone}</Text>
                                    </View>

                                    <View style={styles.deptInfo}>
                                        <Ionicons name="mail" size={16} color="#14b8a6" />
                                        <Text style={styles.deptText}>{dept.email}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
         </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
},
    scrollContent: { paddingBottom: 40 },
   hero: {
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
},
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#0c2f47',
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#0f766e',
        textAlign: 'center',
        marginTop: 12,
        maxWidth: 700,
    },
    directoryLayout: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        padding: 20,
        flexDirection: width > 900 ? 'row' : 'column',
        gap: 24,
    },
    sidebar: {
        width: width > 900 ? 280 : '100%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
        overflow: 'hidden',
    },
    sidebarHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0f2f1' },
    sidebarTitle: { fontSize: 18, fontWeight: '700', color: '#0c2f47', marginBottom: 12 },
    searchInput: {
        backgroundColor: '#f8ffff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    constituencyList: { maxHeight: 500 },
    constituencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activeItem: {
        backgroundColor: '#e0f7fa',
        borderLeftWidth: 4,
        borderLeftColor: '#14b8a6',
    },
    constituencyText: { fontSize: 15, fontWeight: '500', color: '#475569' },
    showMoreBtn: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#f0feff',
        borderTopWidth: 1,
        borderTopColor: '#e0f2f1',
    },
    showMoreText: { color: '#14b8a6', fontWeight: '700' },

    detailsSection: { flex: 1, gap: 24 },
    mlaCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
    },
    mlaHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    mlaIconWrapper: {
        width: 56,
        height: 56,
        backgroundColor: '#14b8a6',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mlaTitle: { fontSize: 24, fontWeight: '800', color: '#0c2f47' },
    infoRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
    label: { fontWeight: '700', color: '#0c2f47', minWidth: 80 },
    value: { color: '#475569', flex: 1 },

    deptTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0c2f47',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    deptCard: {
        width: width > 900 ? '48%' : '100%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    deptName: { fontSize: 18, fontWeight: '700', color: '#0c2f47', marginBottom: 12 },
    deptInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    deptText: { color: '#475569', fontSize: 15 },
});

export default Contact;