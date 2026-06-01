import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
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

  // ── Load user from AsyncStorage (replaces localStorage) ──────────────────
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

  // ── Fetch Public Complaints ───────────────────────────────────────────────
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get<Complaint[]>(
        `${API_BASE_URL}/complaints/public`
      );
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
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPopup(false);
      setPopupMessage("");
    });
  };

  const requireLogin = (): false => {
    showCustomPopup("Please login to continue");
    // Uncomment to redirect after showing popup:
    // setTimeout(() => {
    //   navigation.navigate("Login");
    // }, 1200);
    return false;
  };

  // ── Like Complaint ────────────────────────────────────────────────────────
  const handleLike = async (id: string) => {
    try {
      if (!user || !user._id) return requireLogin();

      const response = await axios.patch<{
        message: string;
        likes: number;
        likedBy: string[];
      }>(`${API_BASE_URL}/complaints/${id}/like`, { userId: user._id });

      showCustomPopup(response.data.message);

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id
            ? {
                ...complaint,
                likes: response.data.likes,
                likedBy: response.data.likedBy ?? complaint.likedBy,
              }
            : complaint
        )
      );

      if (selectedComplaint?._id === id) {
        setSelectedComplaint((prev) =>
          prev
            ? {
                ...prev,
                likes: response.data.likes,
                likedBy: response.data.likedBy ?? prev.likedBy,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error liking complaint:", error);
      const err = error as { response?: { data?: { message?: string } } };
      showCustomPopup(err.response?.data?.message ?? "Failed to like complaint.");
    }
  };

  // ── Repost Complaint ──────────────────────────────────────────────────────
  const handleRepost = async (id: string) => {
    try {
      if (!user || !user._id) return requireLogin();

      const response = await axios.patch<{
        message: string;
        repostedBy: string[];
      }>(`${API_BASE_URL}/complaints/${id}/repost`, { userId: user._id });

      showCustomPopup(response.data.message);

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id
            ? {
                ...complaint,
                repostedBy: response.data.repostedBy ?? complaint.repostedBy,
              }
            : complaint
        )
      );

      if (selectedComplaint?._id === id) {
        setSelectedComplaint((prev) =>
          prev
            ? {
                ...prev,
                repostedBy: response.data.repostedBy ?? prev.repostedBy,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error reposting complaint:", error);
      const err = error as { response?: { data?: { message?: string } } };
      showCustomPopup(err.response?.data?.message ?? "Failed to repost complaint.");
    }
  };

  // ── Add Comment ───────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!user || !user._id) return requireLogin();
    if (!commentText || !commentText.trim()) return;
    if (!selectedComplaint) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/complaints/${selectedComplaint._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: commentText.trim(),
            userId: user._id,
            username: user.name || "Citizen",
            role: user.role || "Citizen",
          }),
        }
      );

      if (!res.ok) throw new Error("Server error");

      const data: Reply = await res.json();

      const updatedComplaints = complaints.map((item) =>
        item._id === selectedComplaint._id
          ? { ...item, replies: [...(item.replies ?? []), data] }
          : item
      );

      setComplaints(updatedComplaints);
      setSelectedComplaint(
        updatedComplaints.find((c) => c._id === selectedComplaint._id) ?? null
      );
      setCommentText("");
    } catch (error) {
      console.error("Comment Error:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  // ── Render Complaint Card ─────────────────────────────────────────────────
  const renderComplaint = ({ item: complaint }: { item: Complaint }) => {
    const hasReposted = complaint.repostedBy?.some(
      (id) => id.toString() === user?._id
    );

    return (
      <View style={styles.complaintCard}>
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
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLike(complaint._id)}
          >
            <FontAwesome name="thumbs-up" size={15} color="#555" />
            <Text style={styles.actionCount}>{complaint.likes ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSelectedComplaint(complaint)}
          >
            <FontAwesome name="comment" size={15} color="#555" />
            <Text style={styles.actionCount}>{complaint.replies?.length ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleRepost(complaint._id)}
          >
            <FontAwesome
              name="retweet"
              size={15}
              color={hasReposted ? "#1DA1F2" : "#555"}
            />
            <Text style={styles.actionCount}>
              {complaint.repostedBy?.length ?? 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.trendingContainer}>
      {/* Popup Toast */}
      {showPopup && (
        <Animated.View style={[styles.customPopup, { opacity: popupOpacity }]}>
          <Text style={styles.popupText}>{popupMessage}</Text>
        </Animated.View>
      )}

      {/* Feed Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.subHeading}>{t("communityCivicFeed")}</Text>
        <Text style={styles.heading}>{t("trendingPublicComplaints")}</Text>
      </View>

      {/* Complaint Grid */}
      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        renderItem={renderComplaint}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Comment Modal */}
      <Modal
        visible={!!selectedComplaint}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedComplaint(null)}
        >
          {/* Stop press propagation by wrapping content in a non-propagating touchable */}
          <TouchableOpacity
            style={styles.commentModalTile}
            activeOpacity={1}
            onPress={() => {
              /* intentionally empty — blocks backdrop tap from closing modal */
            }}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("discussion")}</Text>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Complaint Summary */}
              <View style={styles.complaintSummary}>
                <Text style={styles.summaryTitle}>
                  {selectedComplaint?.title}
                </Text>
                <Text style={styles.summaryDetails}>
                  {selectedComplaint?.details}
                </Text>
              </View>

              {/* Comments List */}
              <View style={styles.commentsList}>
                {(selectedComplaint?.replies?.length ?? 0) > 0 ? (
                  selectedComplaint!.replies.map((reply, i) => (
                    <View key={i} style={styles.singleComment}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.avatarText}>
                          {reply.username?.charAt(0)?.toUpperCase() || "U"}
                        </Text>
                      </View>
                      <View style={styles.commentBody}>
                        <View style={styles.commentUserRow}>
                          <Text style={styles.commentUser}>
                            {reply.username}
                          </Text>
                          {reply.role === "MLA" && (
                            <Text style={styles.officialBadge}>⭐ MLA</Text>
                          )}
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

            {/* Modal Footer — Comment Input */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  trendingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },

  // ── Popup Toast
  customPopup: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#323232",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 999,
    elevation: 10,
  },
  popupText: {
    color: "#fff",
    fontSize: 14,
  },

  // ── Header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  subHeading: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  // ── Grid List
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  // ── Complaint Card
  complaintCard: {
    width: "48.5%",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    width: "100%",
    height: 160,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  topBadges: {
    alignItems: "flex-start",
  },
  categoryBadge: {
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bottomMetadata: {
    paddingBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 18,
  },

  // ── Action Buttons
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentModalTile: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeBtn: {
    fontSize: 20,
    color: "#888",
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ── Complaint Summary
  complaintSummary: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  summaryDetails: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },

  // ── Comments
  commentsList: {
    paddingBottom: 16,
  },
  singleComment: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  commentBody: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 10,
  },
  commentUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    gap: 6,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  officialBadge: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "700",
  },
  commentText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  noComments: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    paddingVertical: 20,
  },

  // ── Modal Footer
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});