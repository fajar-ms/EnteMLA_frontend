import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Complaint {
  id: string;
  userName: string;
  title: string;
  category: string;
  urgency: 'Urgent' | 'Medium' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  date: string;
  details?: string;
  reposts?: number;
}

const URGENCY_RANK = { Urgent: 1, Medium: 2, Normal: 3 };

const COLORS = {
  primaryBg: '#DCEEFB',
  cardBg: '#FFFFFF',
  textPrimary: '#1D1E22',
  textSecondary: '#49494B',
  textMuted: '#6B7C93',
  border: '#B3D4E8',
  accent: '#124E66',
  success: '#2F5E3B',
  warning: '#9A5B13',
  danger: '#A63D40',
} as const;

const urgencyStyle = {
  Urgent: { bg: '#FDE7E3', color: '#9F3A2D' },
  Medium: { bg: '#FFF1D9', color: '#9A6A20' },
  Normal: { bg: '#E8F4FB', color: '#124E66' },
} as const;

const statusStyle = {
  Pending: { bg: '#E6F0F5', color: '#2E3944' },
  'In Progress': { bg: '#E0EEF5', color: '#124E66' },
  Resolved: { bg: '#E8F3E6', color: '#2F5E3B' },
  Rejected: { bg: '#FDEAEA', color: '#A63D40' },
} as const;

interface BadgeProps {
  label: string;
  type?: 'urgency' | 'status';
}

const Badge = ({ label, type = 'urgency' }: BadgeProps) => {
  const style = type === 'urgency' 
    ? urgencyStyle[label as keyof typeof urgencyStyle] 
    : statusStyle[label as keyof typeof statusStyle] || { bg: '#F1F5F9', color: '#333' };

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>{label}</Text>
    </View>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <MaterialIcons name={icon} size={28} color={COLORS.accent} />
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

export default function EmployeeComplaintDashboard() {
  const insets = useSafeAreaInsets();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
  

 useEffect(() => {
  fetchComplaints();
}, []);

const API_URL = "http://10.144.180.158:3001"; // your backend IP

const fetchComplaints = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/complaints/employee`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!Array.isArray(data)) {
      setComplaints([]);
      return;
    }

    setComplaints(
      data.map((c: any) => ({
        ...c,
        id: c._id || c.id,
        userName: c.citizenId?.name || "Unknown Citizen",
        urgency: c.urgency || "Normal",
        status: c.status || "Pending",
        date: c.createdAt
          ? new Date(c.createdAt).toLocaleDateString()
          : "-",
        details: c.details,
        reposts: c.reposts || 0,
      }))
    );
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to load complaints");
  }
};

  const refreshComplaints = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const updateStatus = async (newStatus: Complaint['status']) => {
    if (!selectedComplaint) return;
    setActionLoading(true);

    try {
      // TODO: Add API call here
      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
        )
      );
      setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedComplaint || !replies[selectedComplaint.id]) return;

    try {
      // TODO: Add API call
      Alert.alert('Success', 'Reply sent successfully');
      setReplies(prev => ({ ...prev, [selectedComplaint.id]: '' }));
    } catch (err) {
      Alert.alert('Error', 'Failed to send reply');
    }
  };
 const handleLogout = async () => {
  try {
    await AsyncStorage.multiRemove(['user', 'role', 'token']);
    router.replace('/');
  } catch (err) {
    Alert.alert('Error', 'Logout failed');
  }
};

  const filtered = useMemo(() => {
    let data = complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || 
        [c.userName, c.title, c.category].some(v => v.toLowerCase().includes(q));
      const matchUrgency = !urgencyFilter || c.urgency === urgencyFilter;
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchUrgency && matchStatus;
    });

    return data.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]);
  }, [complaints, search, urgencyFilter, statusFilter]);

  const countByUrgency = (level: 'Urgent' | 'Medium' | 'Normal') => 
    complaints.filter(c => c.urgency === level).length;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshComplaints} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <MaterialIcons name="assignment" size={28} color="#fff" />
            <View>
              <Text style={styles.headerTitle}>Complaint Management</Text>
              <Text style={styles.headerSubtitle}>Employee View</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <StatCard label="Total Complaints" value={complaints.length} icon="assignment" />
          <StatCard label="Urgent" value={countByUrgency("Urgent")} icon="warning" />
          <StatCard label="Medium" value={countByUrgency("Medium")} icon="info" />
          <StatCard label="Normal" value={countByUrgency("Normal")} icon="check-circle" />
        </ScrollView>
<View style={styles.filterContainer}>
  
  {/* Search */}
  <TextInput
    style={styles.searchInput}
    placeholder="Search by citizen, title or category..."
    value={search}
    onChangeText={setSearch}
  />

  {/* Filters Row */}
  <View style={styles.pickerRow}>

    {/* Urgency Filter */}
    <TouchableOpacity
      style={styles.select}
      onPress={() => setShowUrgencyModal(true)}
    >
      <Text style={styles.selectText}>
        {urgencyFilter || "All Urgency"}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="#7ABCD6" />
    </TouchableOpacity>

    {/* Status Filter */}
    <TouchableOpacity
      style={styles.select}
      onPress={() => setShowStatusModal(true)}
    >
      <Text style={styles.selectText}>
        {statusFilter || "All Status"}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="#7ABCD6" />
    </TouchableOpacity>
  </View>

  {/* Count */}
  <Text style={styles.countText}>
    <Text style={{ fontWeight: "800", color: COLORS.textPrimary }}>
      {filtered.length}
    </Text>{" "}
    of {complaints.length} records
  </Text>
</View>
       
        {/* Complaint List */}
        <View style={styles.listContainer}>
          {filtered.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.complaintCard}
              onPress={() => setSelectedComplaint(c)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.citizenName}>{c.userName}</Text>
                <Badge label={c.urgency} type="urgency" />
              </View>

              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.category}>{c.category}</Text>

              <View style={styles.cardFooter}>
                <Badge label={c.status} type="status" />
                <Text style={styles.date}>{c.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Urgency Filter Modal */}
<Modal visible={showUrgencyModal} transparent animationType="fade">
  <TouchableOpacity
    style={styles.modalOverlay}
    onPress={() => setShowUrgencyModal(false)}
  >
    <View style={styles.dropdown}>

      <TouchableOpacity onPress={() => { setUrgencyFilter(""); setShowUrgencyModal(false); }}>
        <Text style={styles.dropdownItem}>All Urgency</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setUrgencyFilter("Urgent"); setShowUrgencyModal(false); }}>
        <Text style={styles.dropdownItem}>Urgent</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setUrgencyFilter("Medium"); setShowUrgencyModal(false); }}>
        <Text style={styles.dropdownItem}>Medium</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setUrgencyFilter("Normal"); setShowUrgencyModal(false); }}>
        <Text style={styles.dropdownItem}>Normal</Text>
      </TouchableOpacity>

    </View>
  </TouchableOpacity>
</Modal>
<Modal visible={showStatusModal} transparent animationType="fade">
  <TouchableOpacity
    style={styles.modalOverlay}
    onPress={() => setShowStatusModal(false)}
  >
    <View style={styles.dropdown}>

      <TouchableOpacity onPress={() => { setStatusFilter(""); setShowStatusModal(false); }}>
        <Text style={styles.dropdownItem}>All Status</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStatusFilter("Pending"); setShowStatusModal(false); }}>
        <Text style={styles.dropdownItem}>Pending</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStatusFilter("In Progress"); setShowStatusModal(false); }}>
        <Text style={styles.dropdownItem}>In Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStatusFilter("Resolved"); setShowStatusModal(false); }}>
        <Text style={styles.dropdownItem}>Resolved</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStatusFilter("Rejected"); setShowStatusModal(false); }}>
        <Text style={styles.dropdownItem}>Rejected</Text>
      </TouchableOpacity>

    </View>
  </TouchableOpacity>
</Modal>

      {/* Detail Modal */}
      <Modal visible={!!selectedComplaint} animationType="slide">
        {selectedComplaint && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Complaint Detail</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalComplaintTitle}>{selectedComplaint.title}</Text>
              <Text style={styles.modalCategory}>{selectedComplaint.category}</Text>

              <View style={styles.badgeRow}>
                <Badge label={selectedComplaint.urgency} type="urgency" />
                <Badge label={selectedComplaint.status} type="status" />
              </View>

              {selectedComplaint.details && (
                <Text style={styles.details}>{selectedComplaint.details}</Text>
              )}

              <Text style={styles.sectionTitle}>Reply to Citizen</Text>
              <TextInput
                style={styles.replyInput}
                multiline
                placeholder="Type your reply here..."
                value={replies[selectedComplaint.id] || ''}
                onChangeText={(text) =>
                  setReplies(prev => ({ ...prev, [selectedComplaint.id]: text }))
                }
              />

              <TouchableOpacity style={styles.sendButton} onPress={handleSendReply}>
                <Text style={styles.sendButtonText}>Send Reply</Text>
              </TouchableOpacity>

              {/* Status Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.progressBtn]}
                  onPress={() => updateStatus('In Progress')}
                >
                  <Text style={styles.actionBtnText}>Mark In Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.resolveBtn]}
                  onPress={() => updateStatus('Resolved')}
                >
                  <Text style={styles.actionBtnText}>Resolve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => updateStatus('Rejected')}
                >
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg },
  scrollContent: { paddingBottom: 100 },
  header: {
    backgroundColor: COLORS.accent,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#B0E0F0', fontSize: 12 },
  
  statsContainer: { padding: 12 },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: 170,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIconContainer: { marginBottom: 10 },
  statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },

  filterContainer: { padding: 12, backgroundColor: '#fff' },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  pickerRow: { flexDirection: 'row', gap: 12 },
  pickerWrapper: { flex: 1 },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
  },
  selectText: { flex: 1, fontSize: 15, color: COLORS.textPrimary },

  listContainer: { padding: 12 },
  complaintCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  citizenName: { fontWeight: '700', fontSize: 16 },
  title: { fontSize: 16, fontWeight: '600', marginVertical: 4 },
  category: { color: COLORS.textMuted, fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  date: { fontSize: 13, color: COLORS.textMuted },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    backgroundColor: COLORS.accent,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, padding: 16 },
  modalComplaintTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  modalCategory: { color: COLORS.textMuted, fontSize: 15, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  details: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8 },

  replyInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 130,
    textAlignVertical: 'top',
    fontSize: 15,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  sendButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  actionButtons: { marginTop: 24, gap: 10 },
  actionBtn: { padding: 15, borderRadius: 12, alignItems: 'center' },
  progressBtn: { backgroundColor: '#E0EEF5' },
  resolveBtn: { backgroundColor: '#E8F3E6' },
  rejectBtn: { backgroundColor: '#FDEAEA' },
  actionBtnText: { fontWeight: '700', fontSize: 15 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#C8DFF0",
  },
  logoutText: { fontWeight: "700", fontSize: 14 },
  countText: {
  marginTop: 10,
  fontSize: 12,
  color: COLORS.textMuted,
  fontWeight: "600",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.3)",
  justifyContent: "center",
  alignItems: "center",
},

dropdown: {
  width: 220,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 10,
  elevation: 5,
},

dropdownItem: {
  padding: 12,
  fontSize: 15,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},




});