// src/components/home/Trending.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, Modal, ScrollView,
    StyleSheet, ActivityIndicator, Dimensions,TextInput, Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Define Complaint Type
interface Complaint {
    _id: string;
    title: string;
    details?: string;
    category?: string;
    evidence?: string;
    likes?: number;
    replies?: any[];
    repostedBy?: string[];
    likedBy?: string[];
}

const { width } = Dimensions.get('window');

const Trending = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
        fetchComplaints();
    }, []);

    const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    };

    const fetchComplaints = async () => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/complaints/public`
            );
            setComplaints(response.data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    const showCustomPopup = (message: string) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
    };

    // Like Handler
    const handleLike = async (id: string) => {
        if (!user?._id) return showCustomPopup("Please login to continue");
        // Add your API call here
        showCustomPopup("Like functionality - API pending");
    };

    // Repost Handler
    const handleRepost = async (id: string) => {
        if (!user?._id) return showCustomPopup("Please login to continue");
        // Add your API call here
        showCustomPopup("Repost functionality - API pending");
    };

    // Comment Handler
    const handleComment = async () => {
        if (!user?._id) return showCustomPopup("Please login to continue");
        if (!commentText.trim()) return;

        // Add your API call here
        showCustomPopup("Comment added (Demo)");
        setCommentText('');
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#14b8a6" style={{ margin: 60 }} />;
    }

    return (
        <View style={styles.container}>
            {showPopup && (
                <View style={styles.popup}>
                    <Text style={styles.popupText}>{popupMessage}</Text>
                </View>
            )}

            <Text style={styles.subHeading}>{t("communityCivicFeed")}</Text>
            <Text style={styles.heading}>{t("trendingPublicComplaints")}</Text>

            <View style={styles.complaintGrid}>
                {complaints.map((complaint) => (
                    <TouchableOpacity
                        key={complaint._id}
                        style={styles.complaintCard}
                        onPress={() => setSelectedComplaint(complaint)}
                    >
                        <Image
                            source={{
                                uri: complaint.evidence
                                    ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/uploads/${complaint.evidence}`
                                    : 'https://images.news18.com/ibnlive/uploads/2023/06/public-grievance-168568115816x9.jpg'
                            }}
                            style={styles.image}
                        />

                        <View style={styles.cardOverlay}>
                            <Text style={styles.categoryBadge}>{complaint.category || 'General'}</Text>
                            <Text style={styles.cardTitle}>{complaint.title}</Text>
                        </View>

                        <View style={styles.cardActions}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(complaint._id)}>
                                <Ionicons name="thumbs-up-outline" size={20} color="#0f766e" />
                                <Text>{complaint.likes || 0}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedComplaint(complaint)}>
                                <Ionicons name="chatbubble-outline" size={20} color="#0f766e" />
                                <Text>{complaint.replies?.length || 0}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleRepost(complaint._id)}>
                                <Ionicons name="repeat-outline" size={20} color="#0f766e" />
                                <Text>{complaint.repostedBy?.length || 0}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Comment Modal */}
            <Modal visible={!!selectedComplaint} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("discussion")}</Text>
                            <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                                <Ionicons name="close" size={28} color="#0f766e" />
                            </TouchableOpacity>
                        </View>

                        {selectedComplaint && (
                            <>
                                <Text style={styles.complaintTitle}>{selectedComplaint.title}</Text>
                                <Text style={styles.complaintDetails}>{selectedComplaint.details}</Text>

                                <ScrollView style={styles.commentsList}>
                                    {selectedComplaint.replies && selectedComplaint.replies.length > 0 ? (
                                        selectedComplaint.replies.map((reply: any, i: number) => (
                                            <View key={i} style={styles.singleComment}>
                                                <View style={styles.commentAvatar}>
                                                    <Text>{reply.username?.[0] || 'U'}</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.commentUser}>{reply.username}</Text>
                                                    <Text>{reply.text}</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noComments}>{t("noComments")}</Text>
                                    )}
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder={t("Write comment......")}
                                        value={commentText}
                                        onChangeText={setCommentText}
                                    />
                                    <TouchableOpacity style={styles.sendBtn} onPress={handleComment}>
                                        <Text style={styles.sendBtnText}>{t("send")}</Text>
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
    container: { padding: 16, backgroundColor: '#fff' },
    subHeading: { fontSize: 14, fontWeight: '700', color: '#0c2f47', textTransform: 'uppercase' },
    heading: { fontSize: 28, fontWeight: '900', color: '#0c2f47', marginBottom: 20 },
    complaintGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
    complaintCard: {
        width: width > 768 ? 280 : '100%',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.2)',
        marginBottom: 16
    },
    image: { width: '100%', height: 200, resizeMode: 'cover' },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
    },
    categoryBadge: {
        backgroundColor: '#14b8a6',
        color: 'white',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: '600',
    },
    cardTitle: { color: 'white', fontWeight: '700', marginTop: 8, fontSize: 16 },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(20,184,166,0.15)',
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    popup: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: '#14b8a6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        zIndex: 1000,
    },
    popupText: { color: 'white', fontWeight: '500' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxWidth: 600,
        maxHeight: '85%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    complaintTitle: { fontSize: 18, fontWeight: '700', padding: 16 },
    complaintDetails: { paddingHorizontal: 16, color: '#555' },
    commentsList: { flex: 1, padding: 16 },
    singleComment: { flexDirection: 'row', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 12 },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#14b8a6',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
    },
    commentUser: { fontWeight: '700', color: '#0c2f47' },
    modalFooter: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
    },
    sendBtn: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: 24,
        borderRadius: 10,
        justifyContent: 'center',
    },
    sendBtnText: { color: 'white', fontWeight: '600' },
    noComments: { textAlign: 'center', color: '#888', padding: 20 },
});

export default Trending;