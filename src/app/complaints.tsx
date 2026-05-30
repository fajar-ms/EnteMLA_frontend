// src/app/complaints.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/home/Navbar';

const { width } = Dimensions.get('window');

const ComplaintsList = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const [complaints, setComplaints] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [selectedForModal, setSelectedForModal] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        loadAuth();
    }, []);

    const loadAuth = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');

        if (storedToken) setToken(storedToken);

        if (!storedToken) {
            setError("Please login to view complaints");
            setLoading(false);
            return;
        }

        fetchComplaints(storedToken);
    };

    const fetchComplaints = async (authToken: string) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setComplaints(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

 const handleLike = async (id: string) => {
    if (!token) return;

    try {
        await axios.patch(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints/${id}/like`, 
            {}, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update the main list
        setComplaints(prev => prev.map(c =>
            c._id === id ? { ...c, likes: (c.likes || 0) + 1 } : c
        ));

        // Update the selected item safely
        if (selected?._id === id) {
            setSelected((prev: any) => ({ 
                ...prev, 
                likes: (prev.likes || 0) + 1 
            }));
        }
    } catch (error: any) {
        Alert.alert("Error", error.response?.data?.message || "Failed to like");
    }
};

    const handleRepost = async (id: string) => {
        if (!token) return;
        try {
            await axios.patch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints/${id}/repost`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComplaints(prev => prev.map(c =>
                c._id === id ? { ...c, reposts: (c.reposts || 0) + 1 } : c
            ));
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to repost");
        }
    };

    const handleComment = async () => {
        if (!commentText.trim() || !selectedForModal || !token) return;

        try {
            const res = await axios.post(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints/${selectedForModal._id}/comment`,
                { text: commentText.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = complaints.map(item =>
                item._id === selectedForModal._id
                    ? { ...item, replies: [...(item.replies || []), res.data] }
                    : item
            );

            setComplaints(updated);
            setSelectedForModal(updated.find(c => c._id === selectedForModal._id));
            setCommentText('');
        } catch (error: any) {
            Alert.alert("Error", "Failed to post comment");
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
        progress: complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
        resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#14b8a6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Complaint Management</Text>
                    <Text style={styles.heroSubtitle}>Track, manage, and resolve citizen complaints efficiently</Text>
                </View>

                {/* Stats Dashboard */}
                <View style={styles.statsContainer}>
                    <Text style={styles.dashboardTitle}>Complaint Control Dashboard</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}><Text style={styles.statNumber}>{stats.total}</Text><Text>Total</Text></View>
                        <View style={[styles.statCard, styles.warn]}><Text style={styles.statNumber}>{stats.pending}</Text><Text>Pending</Text></View>
                        <View style={[styles.statCard, styles.process]}><Text style={styles.statNumber}>{stats.progress}</Text><Text>In Progress</Text></View>
                        <View style={[styles.statCard, styles.done]}><Text style={styles.statNumber}>{stats.resolved}</Text><Text>Resolved</Text></View>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Complaint Queue */}
                    <View style={styles.queue}>
                        <Text style={styles.sectionTitle}>Complaint Queue</Text>
                        <ScrollView style={styles.queueList} nestedScrollEnabled>
                            {complaints.map((c) => (
                                <TouchableOpacity
                                    key={c._id}
                                    style={[styles.queueItem, selected?._id === c._id && styles.activeItem]}
                                    onPress={() => setSelected(c)}
                                >
                                    <View style={styles.badgeRow}>
                                        <Text style={styles.statusTag}>{c.status || 'Pending'}</Text>
                                        <Text style={styles.priorityTag}>{c.priority || "Normal"}</Text>
                                    </View>
                                    <Text style={styles.itemTitle}>{c.title}</Text>
                                    <View style={styles.miniSocial}>
                                        <Text>👍 {c.likes || 0}</Text>
                                        <Text>💬 {c.replies?.length || 0}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Case Details */}
                    <View style={styles.caseFile}>
                        {!selected ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open" size={80} color="#94a3b8" />
                                <Text style={styles.emptyTitle}>Select a Complaint</Text>
                                <Text style={styles.emptyDesc}>Click on any complaint from the left</Text>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.caseTitle}>Case File</Text>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(selected._id)}>
                                        <Ionicons name="thumbs-up" size={22} color="#14b8a6" />
                                        <Text>{selected.likes || 0}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedForModal(selected)}>
                                        <Ionicons name="chatbubble" size={22} color="#14b8a6" />
                                        <Text>{selected.replies?.length || 0}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleRepost(selected._id)}>
                                        <Ionicons name="share-social" size={22} color="#14b8a6" />
                                        <Text>{selected.reposts || 0}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.detailCard}>
                                    <Text style={styles.detailLabel}>Title</Text>
                                    <Text style={styles.detailValue}>{selected.title}</Text>
                                </View>

                                <View style={styles.detailCard}>
                                    <Text style={styles.detailLabel}>Details</Text>
                                    <Text style={styles.detailValue}>{selected.details || selected.description || "No description"}</Text>
                                </View>

                                <View style={styles.detailGrid}>
                                    <View style={styles.detailCard}><Text style={styles.detailLabel}>Status</Text><Text>{selected.status}</Text></View>
                                    <View style={styles.detailCard}><Text style={styles.detailLabel}>Category</Text><Text>{selected.category}</Text></View>
                                </View>

                                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                                    <Text style={styles.closeBtnText}>Close View</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Comment Modal */}
            <Modal visible={!!selectedForModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Discussion</Text>
                            <TouchableOpacity onPress={() => setSelectedForModal(null)}>
                                <Ionicons name="close" size={28} color="#0f766e" />
                            </TouchableOpacity>
                        </View>

                        {selectedForModal && (
                            <>
                                <Text style={styles.modalComplaintTitle}>{selectedForModal.title}</Text>

                                <ScrollView style={styles.commentsList}>
                                    {selectedForModal.replies?.map((reply: any, i: number) => (
                                        <View key={i} style={styles.singleComment}>
                                            <View style={styles.commentAvatar}>
                                                <Text>{reply.username?.[0] || "U"}</Text>
                                            </View>
                                            <View style={styles.commentBody}>
                                                <Text style={styles.commentUser}>{reply.username}</Text>
                                                <Text>{reply.text}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChangeText={setCommentText}
                                    />
                                    <TouchableOpacity style={styles.sendBtn} onPress={handleComment}>
                                        <Text style={styles.sendText}>Send</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0feff' },
    scrollContent: { paddingBottom: 40 },
    hero: { padding: 40, alignItems: 'center', backgroundColor: '#f8ffff' },
    heroTitle: { fontSize: 32, fontWeight: '800', color: '#0c2f47', textAlign: 'center' },
    heroSubtitle: { fontSize: 18, color: '#0f766e', textAlign: 'center', marginTop: 8 },

    statsContainer: { padding: 20 },
    dashboardTitle: { fontSize: 22, fontWeight: '700', color: '#0c2f47', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#14b8a6' },
    statNumber: { fontSize: 28, fontWeight: '800', color: '#0c2f47' },
    warn: { borderColor: '#f59e0b' },
    process: { borderColor: '#06b6d4' },
    done: { borderColor: '#10b981' },

    mainContent: { flexDirection: width > 900 ? 'row' : 'column', padding: 20, gap: 20 },
    queue: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: 'rgba(20,184,166,0.3)' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    queueList: { maxHeight: 600 },
    queueItem: { padding: 16, backgroundColor: '#f9ffff', borderRadius: 14, marginBottom: 12, borderWidth: 1.5, borderColor: '#e0f2f1' },
    activeItem: { backgroundColor: '#e0f7fa', borderColor: '#14b8a6' },

    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    statusTag: { backgroundColor: '#fef3c7', color: '#d97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600' },
    priorityTag: { backgroundColor: '#e0f2fe', color: '#0369a1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600' },

    itemTitle: { fontWeight: '600', marginVertical: 8, fontSize: 16 },
    miniSocial: { flexDirection: 'row', gap: 16, marginTop: 8 },

    caseFile: { flex: 1.6, backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 2, borderColor: 'rgba(20,184,166,0.3)' },
    emptyState: { alignItems: 'center', padding: 60 },
    emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 20 },
    emptyDesc: { color: '#64748b', textAlign: 'center' },

    caseTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },

    actionButtons: { flexDirection: 'row', gap: 12, marginVertical: 20 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#f0feff', borderRadius: 12 },

    detailCard: { backgroundColor: '#f9ffff', padding: 16, borderRadius: 14, marginBottom: 12 },
    detailGrid: { flexDirection: 'row', gap: 12 },
    detailLabel: { fontWeight: '600', color: '#0c2f47', marginBottom: 4 },
    detailValue: { color: '#475569' },

    closeBtn: { marginTop: 20, padding: 14, backgroundColor: '#fee2e2', borderRadius: 12, alignItems: 'center' },
    closeBtnText: { color: '#ef4444', fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '90%', maxWidth: 600, borderRadius: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    modalComplaintTitle: { padding: 20, fontSize: 18, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: '#eee' },

    commentsList: { padding: 20, maxHeight: 400 },
    singleComment: { flexDirection: 'row', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 12 },
    commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' },
    commentBody: { flex: 1 },
    commentUser: { fontWeight: '600' },

    modalFooter: { flexDirection: 'row', padding: 20, gap: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    commentInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
    sendBtn: { backgroundColor: '#14b8a6', paddingHorizontal: 24, borderRadius: 10, justifyContent: 'center' },
    sendText: { color: 'white', fontWeight: '600' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ComplaintsList;