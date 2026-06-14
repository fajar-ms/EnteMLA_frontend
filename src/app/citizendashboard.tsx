import React, { useState, useEffect } from "react";
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==================== TYPES ====================

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  district?: string;
  constituencyId?: string;
  place?: string;
}

interface Complaint {
  id: string;
  _id?: string;
  title: string;
  category: string;
  urgency: string;
  details?: string;
  status: string;
  date: string;
  rejectionReasons?: any[];
  replies?: any[];
  comments?: any[];
  reposts?: number;
}

// ==================== COLORS & STYLES ====================

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
  success: "#1A8A5A",
  accent1: "#1A7AB5",
  accent2: "#B8D9EE",
};

const radius = { sm: 10, md: 14, lg: 20 };

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [details, setDetails] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [file, setFile] = useState(null);
const [previewImage, setPreviewImage] = useState(null);
const [imageModal, setImageModal] = useState(false);

  // Logout
  
  // ← Add this near your other hooks
 const handleLogout = async () => {
        await AsyncStorage.multiRemove(['user', 'role', 'token']);
        setUser(null);
        
        router.replace('/');
    };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");

console.log("TOKEN =", token);
 // Replace with AsyncStorage.getItem('token')
 if (!token) {
      Alert.alert("Error", "No token found");
      return;
    }

        const userRes = await fetch("http://10.144.180.158:3002/users/me/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
          console.log("Status:", userRes.status);
        const userData: User = await userRes.json();
        setUser(userData);

       const compRes = await fetch(
  "http://10.144.180.158:3002/complaints/my-complaints",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
        const compData = await compRes.json();

        if (Array.isArray(compData)) {
          setComplaints(
            compData.map((c: any) => ({
              ...c,
              id: c._id,
              date: new Date(c.createdAt).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddComplaint = async () => {
    if (!title || !category || !urgency || !details) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

   const payload = {
  title,
  category: category === "Other" ? customCategory : category,
  urgency,
  details,
  visibility: visibility || "Public",
  citizenId: user?._id,
};

    try {

      const token = await AsyncStorage.getItem("token");

const res = await fetch(
  "http://10.144.180.158:3001/complaints",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }
);
      if (res.ok) {
        const newComplaint = await res.json();
        const formatted = {
          ...newComplaint,
          id: newComplaint._id,
          date: new Date().toLocaleDateString(),
        };

        setComplaints((prev) => [formatted, ...prev]);
        setTitle(""); 
        setCategory(""); 
        setDetails(""); 
        setUrgency(""); 
        setCustomCategory("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      Alert.alert("Error", "Submission failed");
    }
  };

  const handleDeleteComplaint = (id: string) => {
    Alert.alert("Delete Complaint", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`http://localhost:3001/complaints/${id}`, { method: "DELETE" });
            setComplaints((prev) => prev.filter((c) => c.id !== id));
            if (selectedComplaint?.id === id) setSelectedComplaint(null);
          } catch (err) {
            Alert.alert("Error", "Failed to delete complaint");
          }
        },
      },
    ]);
  };

  const filteredComplaints = complaints.filter((c) =>
  c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  c.id?.toLowerCase().includes(searchQuery.toLowerCase())
);
useEffect(() => {
  if (searchQuery.trim() === "") {
    return;
  }

  if (filteredComplaints.length > 0) {
    setSelectedComplaint(filteredComplaints[0]);
  }
}, [searchQuery, complaints]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={clr.primary} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <FontAwesome name="home" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.appTitle}>Citizen Dashboard</Text>
            <Text style={styles.subtitle}>MLA Portal • Civic Complaint System</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={16} color={clr.text} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile + Track Section */}
      <View style={styles.row}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.label}>My Profile</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
              </Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.userId}>ID: {user?._id}</Text>
            </View>
          </View>

         <View style={styles.profileDetails}>
          {[
            { icon: "envelope", val: user?.email },
            { icon: "phone", val: user?.phone },
            { icon: "map-marker", val: user?.district },
            { icon: "building", val: user?.constituencyId },
          ].map((item, i) => (
            <View key={i} style={styles.detailRow}>
              <FontAwesome name={item.icon as any} size={14} color={clr.accent1} />
              <Text style={styles.detailText}>{item.val || "N/A"}</Text>
            </View>
          ))}
        </View>
        </View>

       {/* Track Complaint Card */}
{/* Track Complaint Card */}
<View style={styles.card}>
  <Text style={styles.label}>Track Complaint</Text>
  
  <View style={styles.searchContainer}>
    <FontAwesome name="search" size={16} color={clr.hint} style={{ marginRight: 8 }} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search by ID or title…"
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  </View>

  <View style={styles.trackDetailsBox}>
    {selectedComplaint ? (
      <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.complaintTitle}>{selectedComplaint.title}</Text>
        <Text style={styles.complaintMeta}>
          ID: {selectedComplaint.id} • {selectedComplaint.category} • {selectedComplaint.date}
        </Text>

        <View style={styles.badgesRow}>
          <StatusBadge status={selectedComplaint.status} />
          <UrgencyBadge level={selectedComplaint.urgency} />
        </View>

        {selectedComplaint.details && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>{selectedComplaint.details}</Text>
          </View>
        )}
        {selectedComplaint.replies &&
 selectedComplaint.replies.length > 0 && (
  <View style={styles.detailsBox}>
    <Text
      style={{
        fontWeight: "bold",
        marginBottom: 10,
      }}
    >
    Updates
    </Text>

    {selectedComplaint.replies.map(
      (reply: any, index: number) => (
        <View
          key={index}
          style={{
            backgroundColor: "#f1f5f9",
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {reply.username}
          </Text>

          <Text>{reply.text}</Text>
        </View>
      )
    )}
  </View>
)}

        <TouchableOpacity 
          style={styles.clearSelectionBtn}
          onPress={() => setSelectedComplaint(null)}
        >
          <Text style={{ color: clr.hint, fontSize: 13, fontWeight: "600" }}>
            Clear Selection
          </Text>
        </TouchableOpacity>
      </ScrollView>
    ) : (
      <Text style={styles.noSelection}>
        Tap on any complaint from below to see full details here
      </Text>
    )}
  </View>
</View>
      </View>

      {/* Lodge Complaint Form */}
      {/* ── LODGE COMPLAINT FORM ── */}
<View style={styles.complaintFormCard}>
  {/* Header */}
  <View style={styles.formHeader}>
    <View>
      <Text style={styles.label}>Lodge a Complaint</Text>
      <Text style={styles.formSubtitle}>
        Fill in the details and submit your civic issue
      </Text>
    </View>

    {submitSuccess && (
      <View style={styles.successBadge}>
        <View style={styles.successDot} />
        <Text style={styles.successText}>Submitted successfully</Text>
      </View>
    )}
  </View>

  {/* Form Fields */}
  <TextInput
    style={styles.input}
    placeholder="Complaint Title (e.g. Street light not working)"
    value={title}
    onChangeText={setTitle}
  />

  <View style={styles.pickerRow}>
    {/* Category */}
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Electricity" value="Electricity" />
        <Picker.Item label="Roads & Infrastructure" value="Roads & Infrastructure" />
        <Picker.Item label="Sanitation" value="Sanitation" />
        <Picker.Item label="Water Supply" value="Water" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      {category === "Other" && (
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="Enter custom category"
          value={customCategory}
          onChangeText={setCustomCategory}
        />
      )}
    </View>

    {/* Urgency */}
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>Urgency</Text>
      <Picker
        selectedValue={urgency}
        onValueChange={setUrgency}
        style={styles.picker}
      >
        <Picker.Item label="Select..." value="" />
        <Picker.Item label="Normal" value="Normal" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Urgent" value="Urgent" />
      </Picker>
    </View>
  </View>

  {/* Visibility */}
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.fieldLabel}>Visibility</Text>
    <Picker
      selectedValue={visibility}
      onValueChange={setVisibility}
      style={styles.picker}
    >
      <Picker.Item label="Select..." value="" />
      <Picker.Item label="Public" value="Public" />
      <Picker.Item label="Private" value="Private" />
    </Picker>
  </View>

  {/* Details */}
  <Text style={styles.fieldLabel}>Complaint Details</Text>
  <TextInput
    style={[styles.input, { height: 110, textAlignVertical: "top" }]}
    placeholder="Describe the issue — location, duration, impact..."
    multiline
    value={details}
    onChangeText={setDetails}
  />

  {/* Upload + Submit Row */}
  <View style={styles.uploadSubmitRow}>
    <TouchableOpacity style={styles.uploadBtn} onPress={() => {/* Open file picker logic */}}>
      <FontAwesome name="upload" size={16} color={clr.accent1} />
      <Text style={styles.uploadText}>Upload Evidence</Text>
    </TouchableOpacity>

    {file && previewImage && (
      <TouchableOpacity onPress={() => setImageModal(true)}>
        <Image source={{ uri: previewImage }} style={styles.previewImage} />
      </TouchableOpacity>
    )}

    <TouchableOpacity style={styles.submitBtn} onPress={handleAddComplaint}>
      <Text style={styles.submitText}>Submit Complaint</Text>
      <FontAwesome name="paper-plane" size={13} color="#fff" />
    </TouchableOpacity>
  </View>
</View>

      {/* My Complaints */}
      <View style={styles.card}>
        <Text style={styles.label}>My Complaints ({filteredComplaints.length})</Text>

        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.complaintCard, selectedComplaint?.id === item.id && styles.selectedCard]}
              onPress={() => setSelectedComplaint(item)}
            >
              <View style={styles.complaintHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteComplaint(item.id)}>
                  <FontAwesome name="trash" size={18} color={clr.danger} />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardMeta}>
                {item.category} • {item.date}
              </Text>

              <View style={styles.statusRow}>
                <StatusBadge status={item.status} />
                <UrgencyBadge level={item.urgency} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Image Modal */}
      <Modal visible={false} transparent animationType="fade">
        {/* Add image modal logic if needed */}
      </Modal>
    </ScrollView>
  );
}

// ==================== HELPER COMPONENTS ====================

const UrgencyBadge = ({ level }: { level: string }) => {
  const colors: any = {
    Urgent: { bg: "#FFF1F2", color: "#BE123C" },
    Medium: { bg: "#FFFBEB", color: "#92400E" },
    Normal: { bg: "#ECFDF5", color: "#065F46" },
  };
  const s = colors[level] || colors.Normal;

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{level}</Text>
    </View>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    Submitted: { bg: "#EEF2FF", color: "#4338CA" },
    Resolved: { bg: "#ECFDF5", color: "#065F46" },
    Rejected: { bg: "#FFF1F2", color: "#BE123C" },
  };
  const s = colors[status] || { bg: "#F1F5F9", color: "#64748B" };

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{status}</Text>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF5FC", padding: 16 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#1A6BAF",
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: { fontSize: 20, fontWeight: "800", color: clr.text },
  subtitle: { fontSize: 12, color: clr.hint },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: clr.border,
  },
  logoutText: { fontWeight: "700", fontSize: 14 },

  row: { marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: clr.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: clr.accent1,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  profileRow: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 12 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D6EDF8",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 22, fontWeight: "800", color: "#0D4F73" },
  name: { fontSize: 18, fontWeight: "800" },
  userId: { fontSize: 12, color: clr.hint, marginTop: 4 },

  profileDetails: { marginTop: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 6 },
  detailText: { fontSize: 13, color: clr.muted },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: clr.border,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },

  trackDetailsBox: { minHeight: 180, justifyContent: "center" },
  complaintTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  complaintMeta: { fontSize: 12, color: clr.hint, marginBottom: 12 },
  badgesRow: { flexDirection: "row", gap: 10 },
  detailsBox: { marginTop: 12, padding: 12, backgroundColor: "#F9F9F9", borderRadius: 10 },
  detailsText: { fontSize: 13, lineHeight: 20 },

  input: {
    borderWidth: 1.5,
    borderColor: "#E6D5C3",
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#FFFDF9",
  },
  pickerRow: { flexDirection: "row", gap: 10 },

  submitBtn: {
  backgroundColor: clr.primary,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: radius.sm,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,
  flex: 1, // important
},
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  complaintCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: clr.border,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: clr.primary,
    backgroundColor: "#D6EDF8",
  },
  complaintHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 10 },
  cardMeta: { fontSize: 12, color: clr.hint, marginVertical: 6 },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 8 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  noSelection: { textAlign: "center", color: clr.hint, fontStyle: "italic" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: clr.bg,
  },
  complaintFormCard: {
  backgroundColor: "#fff",
  borderRadius: radius.lg,
  padding: 18,
  marginBottom: 16,
  borderWidth: 1.5,
  borderColor: clr.border,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
},

formHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
},

formSubtitle: {
  fontSize: 12,
  color: clr.hint,
  fontWeight: "500",
},

successBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#ECFDF5",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 99,
  borderWidth: 1,
  borderColor: "#A7F3D0",
  gap: 6,
},

successDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: clr.success,
},

successText: {
  fontSize: 12,
  fontWeight: "700",
  color: clr.success,
},

fieldLabel: {
  fontSize: 13,
  fontWeight: "600",
  color: clr.muted,
  marginBottom: 6,
},

picker: {
  backgroundColor: "#FFFDF9",
  borderWidth: 1.5,
  borderColor: "#E6D5C3",
  borderRadius: radius.sm,
  padding: 12,
  fontSize: 14,
},

uploadSubmitRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 10,
  gap: 10,
},

uploadBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderWidth: 1.2,
  borderColor: clr.accent2,
  borderStyle: "dashed",
  borderRadius: radius.sm,
  backgroundColor: "#F5ECE3",
  flex: 1, // important
},

uploadText: {
  fontSize: 13,
  fontWeight: "600",
  color: clr.muted,
},

previewImage: {
  width: 50,
  height: 50,
  borderRadius: radius.sm,
  borderWidth: 2,
  borderColor: clr.accent2,
},
clearBtn: {
  marginTop: 12,
  alignSelf: "flex-start",
  paddingVertical: 6,
  paddingHorizontal: 12,
},
clearSelectionBtn: {
  marginTop: 15,
  paddingVertical: 8,
  paddingHorizontal: 14,
  alignSelf: "flex-start",
  borderRadius: 8,
  backgroundColor: "#f1f5f9",
},
});