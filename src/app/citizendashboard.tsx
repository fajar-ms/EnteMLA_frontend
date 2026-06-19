import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const clr = {
  bg: "#E8F4FB",
  card: "#FFFFFF",
  border: "#C8DFF0",
  text: "#0D2137",
  muted: "#2A5F80",
  hint: "#5A9BB8",
  primary: "#1A6BAF",
  primaryLight: "#D6EDF8",
  danger: "#D9534F",
  dangerBg: "#FFF1F0",
  dangerText: "#A94442",
  warning: "#1A7AAF",
  warningBg: "#E0F0FA",
  warningText: "#0D4F73",
  success: "#1A8A5A",
  successBg: "#E0F5EC",
  successText: "#0F5235",
  blue: "#D6EDF8",
  blueText: "#1A5A80",
  accent1: "#1A7AB5",
  accent2: "#B8D9EE",
  inputBg: "#F0F9FF",
  inputBorder: "#BAE0F7",
};

const radius = { sm: 10, md: 14, lg: 20, xl: 28 };
const { width: SCREEN_WIDTH } = Dimensions.get("window");


// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 52 }: { name?: string; size?: number }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue =
    (name || "")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#D6EDF8",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: `hsl(${hue},50%,75%)`,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 7,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: size * 0.33,
          fontWeight: "800",
          color: `hsl(${hue},55%,28%)`,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

// ─── UrgencyBadge ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ level }: { level?: string }) => {
  const map: Record<string, { bg: string; color: string; dot: string; border: string }> = {
    Urgent: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E", border: "#FECDD3" },
    Medium: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
    Normal: { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#A7F3D0" },
  };
  const s = map[level || "Normal"] || map.Normal;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: s.bg,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: s.border,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 4,
      }}
    >
      <View
        style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: s.dot }}
      />
      <Text style={{ fontSize: 10, fontWeight: "700", color: s.color }}>
        {level || "Normal"}
      </Text>
    </View>
  );
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Submitted: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
    Pending: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
    "In Progress": { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
    Resolved: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
    Rejected: { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
  };
  const s = map[status || ""] || { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" };
  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: s.border,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "700", color: s.color }}>
        {status || "Pending"}
      </Text>
    </View>
  );
};

// ─── FieldError ───────────────────────────────────────────────────────────────
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <Text style={{ fontSize: 11, color: clr.danger, marginTop: 4, fontWeight: "500" }}>
      {msg}
    </Text>
  ) : null;

// ─── SelectPicker - Fixed (Status Bar + Top Space) ─────────────────────────
const SelectPicker = ({
  value,
  onChange,
  options,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  hasError?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.input,
          hasError && { borderColor: clr.danger },
          { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 13, color: value ? clr.text : "#9CA3AF" }}>
          {value || placeholder}
        </Text>
        <Text style={{ color: clr.muted, fontSize: 18 }}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity
          style={styles.pickerOverlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.pickerSheet}>
            <View style={{ paddingTop: 40 }} />
            
            <Text style={styles.pickerTitle}>{placeholder}</Text>
            
            <ScrollView 
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              style={styles.pickerScrollView}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            >
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  style={[
                    styles.pickerOption,
                    value === opt && styles.pickerOptionSelected,
                  ]}
                >
                  <Text style={{
                    fontSize: 15.5,
                    color: clr.text,
                    fontWeight: value === opt ? "700" : "500",
                  }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
// ─── Main Component ───────────────────────────────────────────────────────────
interface Complaint {
  id: string;
  _id?: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  details: string;
  date: string;
  visibility?: string;
  reposts?: number;
  replies?: { from: string; text: string }[];
  comments?: { from: string; text: string }[];
  evidence?: string;
  rejectionReasons?: { text: string; adminName: string; adminRole: string }[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  constituencyId?: string;
  place?: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function CitizenDashboard() {
  const [evidence, setEvidence] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [details, setDetails] = useState("");
  const [visibility, setVisibility] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const itemsPerPage = 5;
  const pickEvidence = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    base64: false,
  });

  if (!result.canceled) {
    setEvidence(result.assets[0].uri);
  }
};

  const handleLogout = async () => {
  await AsyncStorage.multiRemove(["user", "role", "token"]);
  router.replace("/login");

  Alert.alert("Logged out", "You have been signed out.");
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");
        if (!token || role?.trim().toLowerCase() !== "citizen") {
          Alert.alert("Unauthorized", "Please log in as a citizen.");
          return;
        }
        const userRes = await fetch(`${API_BASE}/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        setUser(userData);

        const compRes = await fetch(`${API_BASE}/complaints/my-complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const compData = await compRes.json();
        if (Array.isArray(compData)) {
          setComplaints(
            compData.map((c: Complaint) => ({
              ...c,
              id: c._id || c.id,
              reposts: c.reposts || 0,
              date: new Date(c.date).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredComplaints = complaints.filter(
    (c) =>
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const indexOfLast = indexOfFirst + itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirst, indexOfLast);

  const handleDeleteComplaint = async (id: string) => {
    Alert.alert("Delete Complaint", "Are you sure you want to delete this complaint?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/complaints/${id}`, { method: "DELETE" });
            if (res.ok) {
              setComplaints((prev) => prev.filter((c) => c.id !== id));
              if (selectedComplaint?.id === id) setSelectedComplaint(null);
            } else {
              Alert.alert("Error", "Failed to delete complaint.");
            }
          } catch {
            Alert.alert("Error", "Server error while deleting.");
          }
        },
      },
    ]);
  };

  const handleAddComplaint = async () => {
    if (!title || !category || !urgency || !details) {
      Alert.alert("Missing Fields", "Please fill in Title, Category, Urgency, and Details.");
      return;
    }
    const payload = {
      title,
      category: category === "Other" ? customCategory : category,
      urgency,
      details,
      visibility: visibility || "Public",
      citizenId: user?._id,
      evidence,
    };
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setComplaints((prev) => [
          {
            ...saved,
            id: saved._id,
            date: new Date().toLocaleDateString(),
          },
          ...prev,
        ]);
        setTitle(""); setCategory(""); setDetails(""); setUrgency(""); setVisibility("");
        setEvidence(null); 
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        Alert.alert("Error", "Submission failed.");
      }
    } catch {
      Alert.alert("Error", "Check your connection and try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: clr.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={clr.primary} />
        <Text style={{ marginTop: 12, color: clr.muted, fontWeight: "600" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: clr.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={clr.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.pageWrap}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLogo}>
              <View style={styles.logoMark}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>⌂</Text>
              </View>
              <View>
                <View style={styles.sessionBadgeRow}>
                  <View style={styles.sessionDot} />
                  <Text style={styles.sessionText}>Active Session</Text>
                </View>
                <Text style={styles.mainTitle}>Citizen Dashboard</Text>
                <Text style={styles.subCaption}>MLA Portal · Civic Complaint System</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
  style={styles.dashBtn}
  onPress={() => router.push("/")}
>
  <Text style={styles.logoutBtnText}>⌂ Home</Text>
</TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>⏻  Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── ROW 1: Profile Card ── */}
          <View style={styles.card}>
            <Text style={styles.labelHeading}>My Profile</Text>
            <View style={styles.profileIdentityBlock}>
              <Avatar name={user?.name} size={60} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.userDisplayName}>{user?.name || "Anonymous Citizen"}</Text>
                <View style={styles.userIdBadge}>
                  <Text style={styles.userIdText}>ID: {user?._id || "N/A"}</Text>
                </View>
              </View>
            </View>
            {[
              { icon: "✉", val: user?.email, label: "Email Address" },
              { icon: "📞", val: user?.phone, label: "Phone Number" },
              { icon: "📍", val: user?.district, label: "District" },
              { icon: "🏛", val: user?.constituencyId, label: "Constituency" },
              { icon: "📌", val: user?.place, label: "Place" },
            ].map((item, i) => (
              <View key={i} style={styles.profileInfoRow}>
                <Text style={styles.profileIcon}>{item.icon}</Text>
                <Text style={styles.profileLabel}>{item.label}</Text>
                <Text style={styles.profileDataValue}>{item.val || "Not Provided"}</Text>
              </View>
            ))}
          </View>

          {/* ── Instructions Card ── */}
          <View style={[styles.card, { marginTop: 14 }]}>
            <View style={styles.instructionHeader}>
              <View style={styles.instructionIconWrap}>
                <Text style={{ fontSize: 18 }}>🪪</Text>
              </View>
              <Text style={styles.labelHeading}>Instructions</Text>
            </View>
            {[
              "Fill in the specified details of your problem in the respective fields.",
              "Upload supporting evidence or documents related to your complaint.",
              "Click Submit Complaint to register your case.",
              "Once submitted, the complaint will be forwarded to the concerned MLA.",
              "You can track the status of your complaint through this portal.",
              "Visit this page regularly to view the latest updates and progress.",
            ].map((text, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{text}</Text>
              </View>
            ))}
            <View style={styles.instructionTip}>
              <Text style={styles.instructionTipText}>
                💡 Please provide accurate information and valid evidence to help us resolve your issue faster.
              </Text>
            </View>
          </View>

          {/* ── Lodge Complaint Form ── */}
          <View style={[styles.card, { marginTop: 14 }]}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.labelHeading}>Lodge a Complaint</Text>
                <Text style={styles.subLabelText}>Fill in the details and submit your civic issue</Text>
              </View>
              {submitSuccess && (
                <View style={styles.toastSuccess}>
                  <View style={styles.toastDot} />
                  <Text style={styles.toastText}>Submitted successfully</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={styles.formLabel}>Complaint Title</Text>
            <TextInput
              style={[styles.input, !!errors.title && { borderColor: clr.danger }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Street light not working"
              placeholderTextColor="#9CA3AF"
            />
            <FieldError msg={errors.title} />

            {/* Category */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Category</Text>
            <SelectPicker
              value={category}
              onChange={setCategory}
              options={["Electricity", "Roads & Infrastructure", "Water Supply & Sanitation","Environment","Healthcare","Transport","Education","Public Safety","Welfare","Agriculture","Sports","Industries & Commerce","Public Works Department","Fisheries","Food & Civic Supplies","Forest & Wildlife","Motor Vehicle","Information Technology", "Other"]}
              placeholder="Select…"
              hasError={!!errors.category}
            />
            {category === "Other" && (
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Enter custom category"
                placeholderTextColor="#9CA3AF"
              />
            )}
            <FieldError msg={errors.category} />

            {/* Urgency */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Urgency</Text>
            <SelectPicker
              value={urgency}
              onChange={setUrgency}
              options={["Normal", "Medium", "Urgent"]}
              placeholder="Select…"
              hasError={!!errors.urgency}
            />
            <FieldError msg={errors.urgency} />

            {/* Visibility */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Visibility</Text>
            <SelectPicker
              value={visibility}
              onChange={setVisibility}
              options={["Public", "Private"]}
              placeholder="Select…"
            />

            {/* Details */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Complaint Details</Text>
            <TextInput
              style={[
                styles.input,
                { height: 100, textAlignVertical: "top", paddingTop: 10 },
                !!errors.details && { borderColor: clr.danger },
              ]}
              multiline
              numberOfLines={4}
              value={details}
              onChangeText={setDetails}
              placeholder="Describe the issue — location, duration, impact…"
              placeholderTextColor="#9CA3AF"
            />
            <FieldError msg={errors.details} />
            <Text style={[styles.formLabel, { marginTop: 12 }]}>
  Upload Evidence
</Text>

<TouchableOpacity
  style={styles.uploadBtn}
  onPress={pickEvidence}
>
  <Text style={styles.uploadBtnText}>
    📎 Select Image
  </Text>
</TouchableOpacity>

{evidence && (
  <View style={{ marginTop: 10, position: 'relative', width: 120, height: 120 }}>
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => { setPreviewImage(evidence); setImageModal(true); }}
    >
      <Image
        source={{ uri: evidence }}
        style={{
          width: 120,
          height: 120,
          borderRadius: 10,
        }}
      />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setEvidence(null)}
      style={{
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginTop: -1 }}>✕</Text>
    </TouchableOpacity>
  </View>
)}
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddComplaint}>
              <Text style={styles.submitBtnText}>Submit Complaint  ➤</Text>
            </TouchableOpacity>
          </View>

          {/* ── Complaints Ledger ── */}
          <View style={[styles.card, { marginTop: 14 }]}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>My Complaints Ledger</Text>
                <Text style={styles.countSubtitle}>
                  Showing {indexOfFirst + 1}–{Math.min(indexOfLast, totalItems)} of {totalItems} records
                </Text>
              </View>
            </View>

            {/* Search */}
            <TextInput
              style={[styles.input, { marginBottom: 14 }]}
              value={searchQuery}
              onChangeText={(v) => { setSearchQuery(v); setCurrentPage(1); }}
              placeholder="Search by ID or title…"
              placeholderTextColor="#9CA3AF"
            />

            {totalItems === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32 }}>📄</Text>
                <Text style={styles.emptyStateText}>
                  No complaints filed. Use the form above to submit one.
                </Text>
              </View>
            ) : (
              currentItems.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedComplaint(c)}
                    style={[
                      styles.complaintRow,
                      isSelected && { borderColor: clr.primary, backgroundColor: clr.primaryLight },
                    ]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.complaintRowTop}>
                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Text style={styles.complaintId}>#{(c.id || "").slice(-6).toUpperCase()}</Text>
                        <Text style={styles.complaintDate}>{c.date}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteComplaint(c.id)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ fontSize: 14, color: clr.danger }}>🗑</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.complaintTitle}>{c.title}</Text>
                    <Text style={styles.complaintCategory}>{c.category}</Text>

                    <View style={styles.complaintBadgeRow}>
                      <StatusBadge status={c.status} />
                      <UrgencyBadge level={c.urgency} />
                      <View style={styles.repostIndicator}>
                        <Text style={{ fontSize: 11, color: clr.muted }}>⟳ {c.reposts || 0}</Text>
                      </View>
                    </View>

                    {c.evidence && (
                      <TouchableOpacity
                        onPress={() => { setPreviewImage(c.evidence!); setImageModal(true); }}
                        style={styles.evidencePill}
                      >
                        <Text style={{ fontSize: 11, color: clr.primary, fontWeight: "700" }}>
                          📎 View Evidence
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={[styles.pagBtn, currentPage === 1 && { opacity: 0.4 }]}
                >
                  <Text style={styles.pagBtnText}>← Prev</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setCurrentPage(num)}
                      style={[
                        styles.pagNumBtn,
                        currentPage === num && { backgroundColor: clr.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pagNumText,
                          currentPage === num && { color: "#fff" },
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={[styles.pagBtn, currentPage === totalPages && { opacity: 0.4 }]}
                >
                  <Text style={styles.pagBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Track Complaint Modal ── */}
      <Modal
        visible={!!selectedComplaint}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedComplaint(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.popupCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.trackCardHeaderRow}>
                <Text style={styles.labelHeading}>Track Complaint Status</Text>
                <TouchableOpacity
                  onPress={() => setSelectedComplaint(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 20, color: clr.muted }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Title & meta */}
              <Text style={styles.monitorTitle}>{selectedComplaint?.title}</Text>
              <Text style={styles.monitorMeta}>
                ID: {(selectedComplaint?.id || "").toUpperCase()}  ·  {selectedComplaint?.category}  ·  {selectedComplaint?.date}
              </Text>

              <View style={styles.dividerLine} />

              {/* Rejection notice */}
              {selectedComplaint?.status === "Rejected" &&
                selectedComplaint.rejectionReasons &&
                selectedComplaint.rejectionReasons.length > 0 && (
                  <View style={styles.rejectionBox}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Text style={{ fontSize: 13 }}>🚫</Text>
                      <Text style={styles.rejectionAlertTag}>Rejection Reason</Text>
                    </View>
                    <Text style={styles.rejectionExplanation}>
                      {selectedComplaint.rejectionReasons[selectedComplaint.rejectionReasons.length - 1].text}
                    </Text>
                    <Text style={styles.rejectionAttribution}>
                      By: {selectedComplaint.rejectionReasons[0].adminName} ({selectedComplaint.rejectionReasons[0].adminRole})
                    </Text>
                  </View>
                )}

              {/* Badges */}
              <View style={styles.monitorBadgesRow}>
                <View>
                  <Text style={styles.badgeTinyLabel}>Current Status</Text>
                  <StatusBadge status={selectedComplaint?.status} />
                </View>
                <View>
                  <Text style={styles.badgeTinyLabel}>Urgency Priority</Text>
                  <UrgencyBadge level={selectedComplaint?.urgency} />
                </View>
              </View>

              {/* Details */}
              {selectedComplaint?.details && (
                <View style={styles.detailsBubble}>
                  <Text style={styles.detailsText}>{selectedComplaint.details}</Text>
                </View>
              )}

              {/* Replies */}
              <Text style={[styles.badgeTinyLabel, { marginTop: 16, marginBottom: 8 }]}>
                Official Updates / MLA Replies
              </Text>
              {selectedComplaint?.replies && selectedComplaint.replies.length > 0 ? (
                selectedComplaint.replies.map((r, i) => (
                  <View key={i} style={styles.replyBubble}>
                    <Text style={styles.replyAuthor}>{r.from}: </Text>
                    <Text style={styles.replyBodyText}>{r.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.repliesEmpty}>No official remarks or responses recorded yet.</Text>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Image Lightbox Modal ── */}
      <Modal
        visible={imageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModal(false)}
      >
        <TouchableOpacity
          style={styles.imageModalOverlay}
          activeOpacity={1}
          onPress={() => setImageModal(false)}
        >
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setImageModal(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>✕</Text>
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.imageModalImg}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pageWrap: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: clr.bg,
  },

  // Header
  header: {
    marginBottom: 20,
    gap: 14,
  },
  headerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: clr.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#22C55E",
  },
  sessionText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#22C55E",
    letterSpacing: 0.6,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: clr.text,
    letterSpacing: -0.3,
  },
  subCaption: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  dashBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: clr.primary,
    backgroundColor: clr.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dashBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color:" #fff",
  },
  logoutBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: clr.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Card
  card: {
    backgroundColor: clr.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: clr.border,
    padding: 18,
    shadowColor: "#7A5A3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  labelHeading: {
    fontSize: 10,
    fontWeight: "800",
    color: clr.accent1,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Profile
  profileIdentityBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: "800",
    color: clr.text,
  },
  userIdBadge: {
    marginTop: 4,
    backgroundColor: clr.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  userIdText: {
    fontSize: 10,
    fontWeight: "700",
    color: clr.blueText,
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF6FC",
    gap: 8,
  },
  profileIcon: {
    fontSize: 14,
    width: 22,
    textAlign: "center",
  },
  profileLabel: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "600",
    width: 100,
  },
  profileDataValue: {
    fontSize: 12,
    color: clr.text,
    fontWeight: "600",
    flex: 1,
  },

  // Instructions
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  instructionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: clr.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  instructionNumber: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: clr.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  instructionNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    color: clr.text,
    fontWeight: "500",
    lineHeight: 18,
  },
  instructionTip: {
    marginTop: 12,
    backgroundColor: clr.primaryLight,
    borderRadius: 10,
    padding: 10,
  },
  instructionTipText: {
    fontSize: 11,
    color: clr.blueText,
    fontWeight: "600",
    lineHeight: 16,
  },

  // Form
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  subLabelText: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "500",
    marginTop: 2,
  },
  toastSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 5,
  },
  toastDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#10B981",
  },
  toastText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  formLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: clr.accent1,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: clr.text,
    backgroundColor: clr.inputBg,
    borderWidth: 1.5,
    borderColor: clr.inputBorder,
    borderRadius: radius.sm,
  },
  submitBtn: {
    marginTop: 18,
    backgroundColor: clr.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: clr.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.4,
  },

  // Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  pickerScrollView: {
    maxHeight: "100%",
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: clr.accent1,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  pickerOption: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: clr.primaryLight,
  },
  // Complaints list
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: clr.text,
  },
  countSubtitle: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "500",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 12,
    color: clr.muted,
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 240,
    lineHeight: 18,
  },
  complaintRow: {
    backgroundColor: "#F8FBFE",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: clr.border,
    padding: 14,
    marginBottom: 10,
  },
  complaintRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  complaintId: {
    fontSize: 10,
    fontWeight: "800",
    color: clr.muted,
    letterSpacing: 0.6,
  },
  complaintDate: {
    fontSize: 10,
    color: clr.hint,
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 4,
  },
  complaintTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: clr.text,
    marginBottom: 3,
  },
  complaintCategory: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "500",
    marginBottom: 8,
  },
  complaintBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  repostIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  evidencePill: {
    marginTop: 8,
    backgroundColor: clr.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  pagBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: clr.primaryLight,
    borderRadius: 10,
  },
  pagBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: clr.primary,
  },
  pagNumBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: clr.primaryLight,
  },
  pagNumText: {
    fontSize: 12,
    fontWeight: "700",
    color: clr.primary,
  },

  // Track modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(13,33,55,0.55)",
    justifyContent: "flex-end",
  },
  popupCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "85%",
  },
  trackCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  monitorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: clr.text,
    marginBottom: 4,
  },
  monitorMeta: {
    fontSize: 11,
    color: clr.muted,
    fontWeight: "500",
    lineHeight: 16,
  },
  dividerLine: {
    height: 1,
    backgroundColor: clr.border,
    marginVertical: 14,
  },
  rejectionBox: {
    backgroundColor: "#FFF1F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
    padding: 12,
    marginBottom: 14,
  },
  rejectionAlertTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#BE123C",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  rejectionExplanation: {
    fontSize: 12,
    color: "#BE123C",
    fontWeight: "500",
    marginBottom: 6,
    lineHeight: 17,
  },
  rejectionAttribution: {
    fontSize: 10,
    color: "#9F1239",
    fontWeight: "600",
  },
  monitorBadgesRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 14,
  },
  badgeTinyLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: clr.hint,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  detailsBubble: {
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: clr.border,
    marginBottom: 14,
  },
  detailsText: {
    fontSize: 12,
    color: clr.text,
    fontWeight: "500",
    lineHeight: 18,
  },
  replyBubble: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8FBFE",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: clr.border,
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "800",
    color: clr.primary,
  },
  replyBodyText: {
    fontSize: 12,
    color: clr.text,
    fontWeight: "500",
    flex: 1,
    lineHeight: 17,
  },
  repliesEmpty: {
    fontSize: 12,
    color: clr.hint,
    fontStyle: "italic",
    fontWeight: "500",
  },
  uploadBtn: {
  backgroundColor: clr.primaryLight,
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 5,
},

uploadBtnText: {
  color: clr.primary,
  fontWeight: "700",
},

  // Image modal
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageModalImg: {
    width: SCREEN_WIDTH - 40,
    height: "70%",
    borderRadius: 14,
  },
});