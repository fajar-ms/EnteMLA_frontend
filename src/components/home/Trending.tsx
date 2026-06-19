import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Reply {
  username: string;
  role: string;
  text: string;
}

interface Complaint {
  _id: string;
  title: string;
  details: string;
  category: string;
  evidence?: string;
  likes: number;
  likedBy: string[];
  repostedBy: string[];
  replies: Reply[];
}

interface User {
  _id: string;
  name: string;
  role: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

// ─── Component ────────────────────────────────────────────────────────────────
const Trending = () => {
  const { t } = useTranslation();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const popupOpacity = useState(new Animated.Value(0))[0];

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored) as User);
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    };
    loadUser();
  }, []);

  // Fetch complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get<Complaint[]>(`${API_BASE_URL}/complaints/public`);
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Popup Toast ───────────────────────────────────────────────────────────
  const showCustomPopup = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    Animated.sequence([
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(popupOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setShowPopup(false);
      setPopupMessage("");
    });
  };

  const requireLogin = () => {
    showCustomPopup("Please login to continue");
    return false;
  };

  // ── Like Complaint ────────────────────────────────────────────────────────
  const handleLike = async (id: string) => {
    if (!user || !user._id) return requireLogin();

    try {
      const response = await axios.patch(`${API_BASE_URL}/complaints/${id}/like`, { userId: user._id });
      showCustomPopup(response.data.message);

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, likes: response.data.likes, likedBy: response.data.likedBy ?? c.likedBy } : c
        )
      );

      if (selectedComplaint?._id === id) {
        setSelectedComplaint((prev) => prev ? { ...prev, likes: response.data.likes, likedBy: response.data.likedBy ?? prev.likedBy } : prev);
      }
    } catch (error: any) {
      showCustomPopup(error.response?.data?.message ?? "Failed to like complaint.");
    }
  };

  // ── Repost Complaint ──────────────────────────────────────────────────────
  const handleRepost = async (id: string) => {
    if (!user || !user._id) return requireLogin();

    try {
      const response = await axios.patch(`${API_BASE_URL}/complaints/${id}/repost`, { userId: user._id });
      showCustomPopup(response.data.message);

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, repostedBy: response.data.repostedBy ?? c.repostedBy } : c))
      );

      if (selectedComplaint?._id === id) {
        setSelectedComplaint((prev) => prev ? { ...prev, repostedBy: response.data.repostedBy ?? prev.repostedBy } : prev);
      }
    } catch (error: any) {
      showCustomPopup(error.response?.data?.message ?? "Failed to repost complaint.");
    }
  };

  // ── Add Comment ───────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!user || !user._id) {
      requireLogin();
      return;
    }
    if (!commentText?.trim() || !selectedComplaint) return;

    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${selectedComplaint._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText.trim(),
          userId: user._id,
          username: user.name || "Citizen",
          role: user.role || "Citizen",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data: Reply = await res.json();

      const updated = complaints.map((item) =>
        item._id === selectedComplaint._id
          ? { ...item, replies: [...(item.replies ?? []), data] }
          : item
      );

      setComplaints(updated);
      setSelectedComplaint(updated.find((c) => c._id === selectedComplaint._id) ?? null);
      setCommentText("");
      showCustomPopup("Comment added successfully!");
    } catch (error) {
      console.error("Comment Error:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  // ── Render Card ───────────────────────────────────────────────────────────
  const renderComplaint = (complaint: Complaint) => {
    const hasReposted = complaint.repostedBy?.some((id) => id.toString() === user?._id);

    return (
      <View style={styles.complaintCard} key={complaint._id}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => setSelectedComplaint(complaint)}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: complaint.evidence
                ? `${API_BASE_URL}/uploads/${complaint.evidence}`
                : "https://images.news18.com/ibnlive/uploads/2023/06/public-grievance-168568115816x9.jpg",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay}>
            <View style={styles.topBadges}>
              <Text style={styles.categoryBadge}>{complaint.category}</Text>
            </View>
            <View style={styles.bottomMetadata}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {complaint.title}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(complaint._id)}>
            <FontAwesome name="thumbs-up" size={15} color="#555" />
            <Text style={styles.actionCount}>{complaint.likes ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedComplaint(complaint)}>
            <FontAwesome name="comment" size={15} color="#555" />
            <Text style={styles.actionCount}>{complaint.replies?.length ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => handleRepost(complaint._id)}>
            <FontAwesome name="retweet" size={15} color={hasReposted ? "#1DA1F2" : "#555"} />
            <Text style={styles.actionCount}>{complaint.repostedBy?.length ?? 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.trendingContainer}>
      {showPopup && (
        <Animated.View style={[styles.customPopup, { opacity: popupOpacity, zIndex: 10000 }]}>
          <Text style={styles.popupText}>{popupMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.subHeading}>{t("communityCivicFeed")}</Text>
        <Text style={styles.heading}>{t("trendingPublicComplaints")}</Text>
      </View>

      <View style={styles.gridContainer}>
        {complaints.length > 0 ? (
          complaints.map(renderComplaint)
        ) : (
          <Text style={styles.noComplaints}>No trending complaints yet</Text>
        )}
      </View>

      {/* Comment Modal */}
      <Modal
        visible={!!selectedComplaint}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedComplaint(null)}>
          <TouchableOpacity style={styles.commentModalTile} activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("discussion")}</Text>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {showPopup && (
  <Animated.View
    style={[
      styles.commentPopup,
      { opacity: popupOpacity }
    ]}
  >
    <Text style={styles.popupText}>{popupMessage}</Text>
  </Animated.View>
)}

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.complaintSummary}>
                <Text style={styles.summaryTitle}>{selectedComplaint?.title}</Text>
                <Text style={styles.summaryDetails}>{selectedComplaint?.details}</Text>
              </View>

              <View style={styles.commentsList}>
                {(selectedComplaint?.replies?.length ?? 0) > 0 ? (
                  selectedComplaint!.replies.map((reply, i) => (
                    <View key={i} style={styles.singleComment}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.avatarText}>{reply.username?.charAt(0)?.toUpperCase() || "U"}</Text>
                      </View>
                      <View style={styles.commentBody}>
                        <View style={styles.commentUserRow}>
                          <Text style={styles.commentUser}>{reply.username}</Text>
                          {reply.role === "MLA" && <Text style={styles.officialBadge}>⭐ MLA</Text>}
                        </View>
                        <Text style={styles.commentText}>{reply.text}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noComments}>{t("noComments")}</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TextInput
                style={styles.commentInput}
                placeholder={t("Write comment......")}
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
                returnKeyType="send"
                onSubmitEditing={handleComment}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleComment}>
                <Text style={styles.sendButtonText}>{t("send")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Trending;

const styles = StyleSheet.create({
  trendingContainer: { 
    backgroundColor: "#f0f4f8", 
    paddingBottom: 20 
  },
  loadingContainer: { paddingVertical: 60, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#555", marginTop: 10 },

  customPopup: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 10000,
    elevation: 10,
  },
  commentPopup: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: "center",
  },
  popupText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  sectionHeader: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 16 },
  subHeading: { 
    fontSize: 11, 
    color: "#64748b", 
    textTransform: "uppercase", 
    letterSpacing: 1.2, 
    marginBottom: 4,
    fontWeight: "700"
  },
  heading: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#1a1a2e" 
  },

  gridContainer: {
    paddingHorizontal: 16, // Adjusted margins to sync item column layouts
    paddingBottom: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noComplaints: { textAlign: "center", padding: 40, color: "#888", fontSize: 16, width: "100%" },

  complaintCard: {
    width: "48.5%",
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#c8dff0", // Configured card borders to match About page
  },
  imageContainer: { width: "100%", height: 140 },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "rgba(15, 23, 42, 0.35)", 
  },
  topBadges: { alignItems: "flex-start" },
  categoryBadge: {
    backgroundColor: "#3b82f6", 
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  bottomMetadata: { paddingBottom: 2 },
  cardTitle: { fontSize: 12.5, fontWeight: "700", color: "#fff", lineHeight: 17 },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f8fbfe", // Bottom action bar subtle tone
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0", 
  },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 4, gap: 4 },
  actionCount: { fontSize: 12, color: "#475569", marginLeft: 4, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "flex-end" },
  commentModalTile: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#c8dff0",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a2e" },
  closeBtn: { fontSize: 20, color: "#64748b", padding: 4 },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  complaintSummary: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 12 },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a2e", marginBottom: 4 },
  summaryDetails: { fontSize: 13, color: "#475569", lineHeight: 19 },
  commentsList: { paddingBottom: 16 },
  singleComment: { flexDirection: "row", marginBottom: 12, alignItems: "flex-start" },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6", 
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  commentBody: { flex: 1, backgroundColor: "#f8fbfe", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  commentUserRow: { flexDirection: "row", alignItems: "center", marginBottom: 3, gap: 6 },
  commentUser: { fontSize: 12.5, fontWeight: "700", color: "#1a1a2e" },
  officialBadge: { fontSize: 10.5, color: "#f59e0b", fontWeight: "700" },
  commentText: { fontSize: 12.5, color: "#475569", lineHeight: 18 },
  noComments: { textAlign: "center", color: "#64748b", fontSize: 13, paddingVertical: 20 },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#c8dff0",
    gap: 10,
    backgroundColor: "#fff"
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    backgroundColor: "#f8fbfe",
    color: "#1a1a2e",
  },
  sendButton: { 
    backgroundColor: "#3b82f6", 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 24 
  },
  sendButtonText: { color: "#fff", fontWeight: "800", fontSize: 13.5 },
});