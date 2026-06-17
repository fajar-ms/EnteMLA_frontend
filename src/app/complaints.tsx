// src/app/complaints.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ImageBackground,
    StyleSheet,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/home/Navbar';

const BG_IMAGE = 'https://i.postimg.cc/xC3v5cLV/2.png';

const ComplaintsList = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [complaints, setComplaints] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [selectedForModal, setSelectedForModal] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [commentError, setCommentError] = useState('');

    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    const api = axios.create({
        baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        },
    });

    // AsyncStorage is async (unlike localStorage), so this one extra effect
    // just loads the stored token/user once on mount — same data, same source,
    // no change to any of the logic below.
    useEffect(() => {
        const loadStoredAuth = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');
            setUser(storedUser ? JSON.parse(storedUser) : null);
            setToken(storedToken);
        };
        loadStoredAuth();
    }, []);

    useEffect(() => {
        const fetchComplaints = async () => {
            if (!token) {
                setError('Please login to view complaints');
                return;
            }

            try {
                const response = await api.get('/complaints');
                setComplaints(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load complaints');
            }
        };

        fetchComplaints();
    }, [token]);

    const handleSelect = (complaint: any) => {
        setSelected(complaint);
    };

    // Improved Like with better error message
    const handleLike = async (id: string) => {
        try {
            const res = await api.patch(`/complaints/${id}/like`);
            console.log('Like Success:', res.data);

            setComplaints(prev =>
                prev.map(item =>
                    item._id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
                )
            );

            if (selected && selected._id === id) {
                setSelected((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
            }
        } catch (error: any) {
            console.error('Like Error:', error.response?.data || error.message);
            const msg = error.response?.data?.message || 'Failed to like complaint';
            Alert.alert('Error', msg);
        }
    };

    // Improved Repost
    const handleRepost = async (id: string) => {
        try {
            const res = await api.patch(`/complaints/${id}/repost`);
            console.log('Repost Success:', res.data);

            setComplaints(prev =>
                prev.map(item =>
                    item._id === id ? { ...item, reposts: (item.reposts || 0) + 1 } : item
                )
            );

            if (selected && selected._id === id) {
                setSelected((prev: any) => ({ ...prev, reposts: (prev.reposts || 0) + 1 }));
            }
        } catch (error: any) {
            console.error('Repost Error:', error.response?.data || error.message);
            const msg = error.response?.data?.message || 'Failed to repost complaint';
            Alert.alert('Error', msg);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setCommentError('');

        try {
            const res = await api.post(`/complaints/${selectedForModal._id}/comment`, {
                text: commentText.trim(),
                userId: user?._id,
                username: user?.name || user?.username || 'Citizen',
            });

            const updated = complaints.map(item =>
                item._id === selectedForModal._id
                    ? { ...item, replies: [...(item.replies || []), res.data] }
                    : item
            );

            setComplaints(updated);
            setSelectedForModal(updated.find(c => c._id === selectedForModal._id));
            setCommentText('');
        } catch (error: any) {
            console.error('Comment Error:', error.response?.data || error.message);
            setCommentError('Failed to post comment. Please try again.');
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status?.toLowerCase() === 'pending').length,
        progress: complaints.filter(c => c.status?.toLowerCase() === 'in progress').length,
        resolved: complaints.filter(c => c.status?.toLowerCase() === 'resolved').length,
    };

    // Returns a style object instead of a CSS class name (no CSS classes on RN),
    // but the matching logic is identical to the web version.
    const getStatusClass = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('pending')) return styles.tagWarn;
        if (s.includes('progress')) return styles.tagProcess;
        if (s.includes('resolved')) return styles.tagDone;
        return {};
    };

    if (error) {
        return (
            <ImageBackground source={{ uri: BG_IMAGE }} style={styles.loadingContainer} resizeMode="cover">
                <View style={styles.bgOverlay} />
                <View style={styles.loginAlertBox}>
                    <Text style={styles.loginAlertTitle}>Please login to view complaints</Text>
                    <TouchableOpacity
                        style={styles.loginRedirectBtn}
                        onPress={async () => {
                            await AsyncStorage.setItem('role', 'citizen');
                            (router as any).push('/login');
                        }}
                    >
                        <Text style={styles.loginRedirectBtnText}>Login →</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={{ uri: BG_IMAGE }} style={styles.pageWrapper} resizeMode="cover">
            <View style={styles.bgOverlay} />
            <Navbar />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.complaintHero}>
                    <Text style={styles.heroTitle}>Complaint Management</Text>
                    <Text style={styles.heroSubtitle}>
                        Track, manage, and resolve citizen complaints efficiently
                    </Text>
                </View>

                <View style={styles.controlDashboard}>
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="stats-chart-outline" size={20} color="#3b82f6" />
                            <Text style={styles.headerTitle}>Complaint Control Dashboard</Text>
                        </View>
                        <View style={styles.stats}>
                            <View style={styles.statItem}>
                                <Ionicons name="list-outline" size={12} color="#60a5fa" />
                                <Text style={styles.statLabel}>Total</Text>
                                <Text style={styles.statValue}>{stats.total}</Text>
                            </View>
                            <View style={[styles.statItem, styles.statWarn]}>
                                <Ionicons name="time-outline" size={12} color="#f59e0b" />
                                <Text style={styles.statLabel}>Pending</Text>
                                <Text style={styles.statValue}>{stats.pending}</Text>
                            </View>
                            <View style={[styles.statItem, styles.statProcess]}>
                                <Ionicons name="sync-outline" size={12} color="#3b82f6" />
                                <Text style={styles.statLabel}>In Progress</Text>
                                <Text style={styles.statValue}>{stats.progress}</Text>
                            </View>
                            <View style={[styles.statItem, styles.statDone]}>
                                <Ionicons name="checkmark-circle-outline" size={12} color="#22c55e" />
                                <Text style={styles.statLabel}>Resolved</Text>
                                <Text style={styles.statValue}>{stats.resolved}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.body}>
                        <View style={styles.queue}>
                            <View style={styles.queueHeader}>
                                <Ionicons name="folder-open-outline" size={16} color="#3b82f6" />
                                <Text style={styles.queueTitle}>Complaint Queue</Text>
                            </View>
                            <ScrollView style={styles.queueScroll} nestedScrollEnabled>
                                {complaints.map(c => (
                                    <TouchableOpacity
                                        key={c._id}
                                        style={[styles.item, selected?._id === c._id && styles.itemActive]}
                                        onPress={() => handleSelect(c)}
                                    >
                                        <View style={styles.badgeRow}>
                                            <Text style={[styles.tagStatus, getStatusClass(c.status)]}>
                                                {c.status}
                                            </Text>
                                            <Text style={styles.tagUrgency}>{c.priority || 'Normal'}</Text>
                                        </View>
                                        <Text style={styles.itemTitle}>{c.title}</Text>
                                        <View style={styles.miniSocial}>
                                            <View style={styles.miniSocialItem}>
                                                <Ionicons name="thumbs-up-outline" size={11} color="#93c5fd" />
                                                <Text style={styles.miniSocialText}>{c.likes || 0}</Text>
                                            </View>
                                            <View style={styles.miniSocialItem}>
                                                <Ionicons name="chatbubble-outline" size={11} color="#93c5fd" />
                                                <Text style={styles.miniSocialText}>{c.replies?.length || 0}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.file}>
                            {!selected ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="folder-open-outline" size={90} color="rgba(147,197,253,0.5)" />
                                    <Text style={styles.emptyTitle}>Select a Complaint</Text>
                                    <Text style={styles.emptyDesc}>
                                        Tap on any complaint from the queue to view complete details
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.caseFile}>
                                    <View style={styles.caseTitleRow}>
                                        <Ionicons name="folder-open-outline" size={18} color="#3b82f6" />
                                        <Text style={styles.caseTitle}>Case File</Text>
                                    </View>

                                    <View style={styles.socialActionsRow}>
                                        <TouchableOpacity
                                            style={styles.socialBtn}
                                            onPress={() => handleLike(selected._id)}
                                        >
                                            <Ionicons name="thumbs-up-outline" size={14} color="#60a5fa" />
                                            <Text style={styles.socialBtnText}>{selected.likes || 0}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.socialBtn}
                                            onPress={() => setSelectedForModal(selected)}
                                        >
                                            <Ionicons name="chatbubble-outline" size={14} color="#60a5fa" />
                                            <Text style={styles.socialBtnText}>
                                                {selected.replies?.length || 0}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.socialBtn}
                                            onPress={() => handleRepost(selected._id)}
                                        >
                                            <Ionicons name="share-social-outline" size={14} color="#60a5fa" />
                                            <Text style={styles.socialBtnText}>{selected.reposts || 0}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Rest of case file remains same */}
                                    <View style={styles.detailCard}>
                                        <View style={styles.detailLabelRow}>
                                            <Ionicons name="pricetag-outline" size={12} color="#1d6fab" />
                                            <Text style={styles.detailLabel}>Title</Text>
                                        </View>
                                        <Text style={styles.detailValue}>{selected.title}</Text>
                                    </View>

                                    <View style={styles.detailCard}>
                                        <Text style={styles.detailLabel}>Full Details</Text>
                                        <Text style={styles.detailValue}>
                                            {selected.details ||
                                                selected.description ||
                                                selected.content ||
                                                'No description provided.'}
                                        </Text>
                                    </View>

                                    <View style={styles.detailGrid}>
                                        <View style={[styles.detailCard, styles.detailGridItem]}>
                                            <Text style={styles.detailLabel}>Status</Text>
                                            <Text style={styles.detailValue}>{selected.status}</Text>
                                        </View>
                                        <View style={[styles.detailCard, styles.detailGridItem]}>
                                            <Text style={styles.detailLabel}>Category</Text>
                                            <Text style={styles.detailValue}>
                                                {selected.category || 'General'}
                                            </Text>
                                        </View>
                                        <View style={[styles.detailCard, styles.detailGridItem]}>
                                            <Text style={styles.detailLabel}>Priority</Text>
                                            <Text style={styles.detailValue}>
                                                {selected.priority || 'Normal'}
                                            </Text>
                                        </View>
                                        <View style={[styles.detailCard, styles.detailGridItem]}>
                                            <View style={styles.detailLabelRow}>
                                                <Ionicons name="calendar-outline" size={12} color="#1d6fab" />
                                                <Text style={styles.detailLabel}>Submitted On</Text>
                                            </View>
                                            <Text style={styles.detailValue}>
                                                {selected.createdAt
                                                    ? new Date(selected.createdAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.closeCaseBtn}
                                        onPress={() => setSelected(null)}
                                    >
                                        <Text style={styles.closeCaseBtnText}>Close View</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modal remains same */}
            <Modal
                visible={!!selectedForModal}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedForModal(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedForModal(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.commentModalTile} onPress={() => {}}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderTitle}>Discussion</Text>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setSelectedForModal(null)}
                            >
                                <Ionicons name="close" size={18} color="#1d6fab" />
                            </TouchableOpacity>
                        </View>

                        {selectedForModal && (
                            <>
                                <ScrollView style={styles.modalContent}>
                                    <View style={styles.complaintSummary}>
                                        <Text style={styles.complaintSummaryTitle}>
                                            {selectedForModal.title}
                                        </Text>
                                        <Text style={styles.complaintSummaryText}>
                                            {selectedForModal.details || selectedForModal.description}
                                        </Text>
                                    </View>

                                    <View style={styles.commentsList}>
                                        {selectedForModal.replies?.length > 0 ? (
                                            selectedForModal.replies.map((reply: any, i: number) => (
                                                <View key={i} style={styles.singleComment}>
                                                    <View style={styles.commentAvatar}>
                                                        <Text style={styles.commentAvatarText}>
                                                            {reply.username?.[0] || 'U'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.commentBody}>
                                                        <Text style={styles.commentUser}>
                                                            {reply.username || 'Citizen'}
                                                        </Text>
                                                        <Text style={styles.commentText}>{reply.text}</Text>
                                                    </View>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noComments}>
                                                No comments yet. Be the first to reply!
                                            </Text>
                                        )}
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Write a comment..."
                                        placeholderTextColor="#8fa3b1"
                                        value={commentText}
                                        onChangeText={setCommentText}
                                    />
                                    <TouchableOpacity style={styles.modalSendBtn} onPress={handleComment}>
                                        <Text style={styles.modalSendBtnText}>Send</Text>
                                    </TouchableOpacity>
                                    {commentError ? <Text style={styles.errorText}>{commentError}</Text> : null}
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ImageBackground>
    );
};

const ink = '#0c2f47';
const muted = '#475569';
const mutedLt = '#94a3b8';

const styles = StyleSheet.create({
    pageWrapper: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    bgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(239,246,255,0.55)',
    },
    scrollContent: { paddingBottom: 60 },

    // Login alert box
    loginAlertBox: {
        backgroundColor: 'rgba(239,246,255,0.92)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.7)',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 36,
        alignItems: 'center',
        maxWidth: 340,
    },
    loginAlertTitle: { fontSize: 20, fontWeight: '600', color: ink, marginBottom: 20, textAlign: 'center' },
    loginRedirectBtn: {
        backgroundColor: '#1d6fab',
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    loginRedirectBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    // Hero
    complaintHero: { alignItems: 'center', paddingTop: 60, paddingBottom: 36, paddingHorizontal: 24 },
    heroTitle: { fontSize: 30, fontWeight: '700', color: ink, textAlign: 'center', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, color: muted, textAlign: 'center', lineHeight: 22 },

    // Dashboard shell
    controlDashboard: { paddingHorizontal: 16 },
    header: {
        backgroundColor: 'rgba(239,246,255,0.75)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.7)',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        gap: 14,
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: ink },

    stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.55)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    statLabel: { fontSize: 12, color: muted },
    statValue: { fontSize: 12, fontWeight: '700', color: ink, marginLeft: 2 },
    statWarn: { borderColor: 'rgba(251,191,36,0.4)', backgroundColor: 'rgba(255,251,235,0.7)' },
    statProcess: { borderColor: 'rgba(96,165,250,0.4)', backgroundColor: 'rgba(239,246,255,0.8)' },
    statDone: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(240,253,244,0.8)' },

    // Body (single column — mirrors the web version's mobile breakpoint)
    body: { gap: 14 },

    // Queue
    queue: {
        backgroundColor: 'rgba(239,246,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.65)',
        borderRadius: 20,
        overflow: 'hidden',
    },
    queueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(147,197,253,0.2)',
    },
    queueTitle: { fontSize: 16, fontWeight: '600', color: ink },
    queueScroll: { maxHeight: 340 },

    item: { paddingVertical: 14, paddingHorizontal: 18, borderLeftWidth: 3, borderLeftColor: 'transparent' },
    itemActive: { backgroundColor: 'rgba(96,165,250,0.1)', borderLeftColor: '#3b82f6' },

    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    tagStatus: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(96,165,250,0.12)',
        color: '#1d6fab',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.2)',
        overflow: 'hidden',
    },
    tagWarn: { backgroundColor: 'rgba(251,191,36,0.12)', color: '#b45309', borderColor: 'rgba(251,191,36,0.25)' },
    tagProcess: { backgroundColor: 'rgba(96,165,250,0.12)', color: '#1d6fab', borderColor: 'rgba(96,165,250,0.25)' },
    tagDone: { backgroundColor: 'rgba(74,222,128,0.12)', color: '#15803d', borderColor: 'rgba(74,222,128,0.25)' },
    tagUrgency: {
        fontSize: 10,
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.65)',
        color: mutedLt,
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.5)',
        overflow: 'hidden',
    },
    itemTitle: { fontSize: 15, fontWeight: '600', color: ink, marginVertical: 6 },
    miniSocial: { flexDirection: 'row', gap: 14, marginTop: 4 },
    miniSocialItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    miniSocialText: { fontSize: 12, color: mutedLt },

    // File / case detail
    file: {
        backgroundColor: 'rgba(239,246,255,0.7)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.65)',
        borderRadius: 20,
        minHeight: 320,
    },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, minHeight: 300 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: ink },
    emptyDesc: { fontSize: 13, color: mutedLt, textAlign: 'center', maxWidth: 260 },

    caseFile: { padding: 22 },
    caseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
    caseTitle: { fontSize: 20, fontWeight: '600', color: ink },

    socialActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.3)',
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    socialBtnText: { color: '#1d6fab', fontSize: 13 },

    detailCard: {
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.55)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1d6fab',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: { fontSize: 14, color: muted, lineHeight: 20 },

    detailGrid: { flexDirection: 'column', gap: 10, marginBottom: 10 },
    detailGridItem: { marginBottom: 0 },

    closeCaseBtn: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.35)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 20,
        marginTop: 6,
    },
    closeCaseBtnText: { color: '#1d6fab', fontWeight: '500', fontSize: 13 },

    // Comment modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    commentModalTile: {
        backgroundColor: 'rgba(239,246,255,0.97)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.8)',
        borderRadius: 22,
        width: '100%',
        maxWidth: 480,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(147,197,253,0.22)',
    },
    modalHeaderTitle: { fontSize: 18, fontWeight: '600', color: ink },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(96,165,250,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.22)',
    },

    modalContent: { padding: 18 },
    complaintSummary: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.55)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    complaintSummaryTitle: { fontSize: 15, fontWeight: '600', color: ink, marginBottom: 6 },
    complaintSummaryText: { fontSize: 13, color: muted, lineHeight: 20 },

    commentsList: { gap: 12 },
    singleComment: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1d6fab',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    commentBody: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(186,230,253,0.5)',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    commentUser: { fontSize: 12, fontWeight: '600', color: '#1d6fab', marginBottom: 3 },
    commentText: { fontSize: 13, color: muted, lineHeight: 19 },
    noComments: { fontSize: 13, color: mutedLt, textAlign: 'center', paddingVertical: 20 },

    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(147,197,253,0.22)',
    },
    modalInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderWidth: 1,
        borderColor: 'rgba(147,197,253,0.5)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        color: ink,
    },
    modalSendBtn: {
        backgroundColor: '#1d6fab',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    modalSendBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    errorText: { fontSize: 12, color: '#dc2626' },
});

export default ComplaintsList;