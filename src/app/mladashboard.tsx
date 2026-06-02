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
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Complaint {
  id: string;
  userName: string;
  title: string;
  category?: string;
  ward?: string;
  urgency: 'Urgent' | 'Medium' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected' | 'Forwarded';
  date: string;
  reposts?: number;
  details?: string;
  description?: string;
  comment?: string;
}

const clr = {
  bg: '#E8F4FB',
  paper: '#FFFFFF',
  border: '#C8DFF0',
  text: '#0D2137',
  textMid: '#1A3A55',
  muted: '#4A7A9B',
  hint: '#7AAEC8',
  primary: '#1A6BAF',
  accent: '#1565C0',
  success: '#1A8A5A',
  warning: '#1A7AAF',
  inProgress: '#1A55A0',
  gold: '#1A7BB5',
} as const;

const UrgencyBadge = ({ level }: { level: string }) => {
  const map: any = {
    Urgent: { bg: '#E3F0FC', color: clr.accent, label: '● Urgent' },
    Medium: { bg: '#DCF0FB', color: clr.warning, label: '● Medium' },
    Normal: { bg: '#E0F5EC', color: clr.success, label: '● Normal' },
  };
  const s = map[level] || map.Normal;

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: any = {
    Pending: { bg: '#E0F0FA', color: clr.primary },
    'In Progress': { bg: '#E0ECFA', color: clr.inProgress },
    Resolved: { bg: '#E0F5EC', color: clr.success },
    Rejected: { bg: '#E3F0FC', color: clr.accent },
    Forwarded: { bg: '#DCF0FB', color: clr.gold },
  };
  const s = map[status] || { bg: '#F1EDE5', color: clr.muted };

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{status}</Text>
    </View>
  );
};

const StatCard = ({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) => (
  <View style={styles.statCard}>
    <MaterialIcons name={icon} size={32} color={color} style={styles.statIcon} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default function MlaComplaintDashboard() {
  const insets = useSafeAreaInsets();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
   const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
const router = useRouter();

  const [filters, setFilters] = useState({
    urgency: '',
    category: '',
    ward: '',
    status: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("token");

    const API_URL = "http://10.144.180.158:3001";

    const res = await fetch(`${API_URL}/complaints/employee`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!Array.isArray(data)) {
      setComplaints([]);
      return;
    }

    setComplaints(
      data.map((c: any) => ({
        id: c._id || c.id,
        userName: c.citizenId?.name || "Unknown",
        title: c.title,
        category: c.category,
        ward: c.ward,
        urgency: c.urgency || "Normal",
        status: c.status || "Pending",
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
        reposts: c.reposts || 0,
        details: c.details,
        description: c.description,
        comment: c.comment,
      }))
    );

  } catch (err) {
    console.log("FETCH ERROR:", err);
    setError("Could not connect to server");
  } finally {
    setLoading(false);
  }
};

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const setFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ urgency: '', category: '', ward: '', status: '' });
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'role', 'token']);
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', 'Logout failed');
    }
  };

 const filteredComplaints = useMemo(() => {
  return complaints
    // SEARCH FILTER
    .filter(c => {
      const q = search.toLowerCase();
      return (
        !q ||
        c.userName?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    })

    // URGENCY FILTER
    .filter(c => !urgencyFilter || c.urgency === urgencyFilter)

    // STATUS FILTER
    .filter(c => !statusFilter || c.status === statusFilter)

    // SORT
    .sort((a, b) => {
      const urgencyScore = (u: string) =>
        u === 'Urgent' ? 1 : u === 'Medium' ? 2 : 3;

      return (
        urgencyScore(a.urgency) - urgencyScore(b.urgency) ||
        (b.reposts || 0) - (a.reposts || 0)
      );
    });
}, [complaints, search, urgencyFilter, statusFilter]);

  const totalComplaints = complaints.length;
  const urgentIssues = complaints.filter(c => c.urgency === 'Urgent').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const trendingComplaints = complaints.filter(c => (c.reposts || 0) >= 5).length;

  const isCaseClosed = selectedComplaint?.status === 'Resolved' || selectedComplaint?.status === 'Rejected';

  const updateStatus = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setActionLoading(true);

    try {
      // TODO: Add API call here
      setComplaints(prev =>
        prev.map(c => (c.id === selectedComplaint.id ? { ...c, status: newStatus as any, comment } : c))
      );
      setSelectedComplaint(prev => (prev ? { ...prev, status: newStatus as any, comment } : null));
      setComment('');
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading MLA Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            
            <View>
              <Text style={styles.headerTitle}>MLA Complaint Dashboard</Text>
              <Text style={styles.subtitle}>Constituency Portal</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
                  </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <StatCard label="Total Complaints" value={totalComplaints} color={clr.primary} icon="assignment" />
          <StatCard label="Urgent Issues" value={urgentIssues} color={clr.accent} icon="warning" />
          <StatCard label="Pending" value={pendingCount} color={clr.warning} icon="hourglass-empty" />
          <StatCard label="Resolved" value={resolvedCount} color={clr.success} icon="check-circle" />
          <StatCard label="Trending" value={trendingComplaints} color={clr.gold} icon="repeat" />
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
    <Text style={{ fontWeight: "800", color: '#1D1E22', }}>
      {filteredComplaints.length}
    </Text>{" "}
    of {complaints.length} records
  </Text>
</View>

        {/* Complaints List */}
        <FlatList
          data={filteredComplaints}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.complaintCard} onPress={() => setSelectedComplaint(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.userName}>{item.userName}</Text>
                <UrgencyBadge level={item.urgency} />
              </View>
              <Text style={styles.complaintTitle}>{item.title}</Text>
              <Text style={styles.ward}>Ward: {item.ward || 'General'}</Text>

              <View style={styles.cardFooter}>
                <StatusBadge status={item.status} />
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No complaints found</Text>}
        />
      </ScrollView>
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
                <MaterialIcons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Complaint Details</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalComplaintTitle}>{selectedComplaint.title}</Text>

              <View style={styles.badgesRow}>
                <UrgencyBadge level={selectedComplaint.urgency} />
                <StatusBadge status={selectedComplaint.status} />
              </View>

              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.details}>
                {selectedComplaint.details || selectedComplaint.description || 'No description provided.'}
              </Text>

              <Text style={styles.sectionLabel}>Add Update / Remark</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder={isCaseClosed ? "Case is closed" : "Write your remarks here..."}
                value={comment}
                onChangeText={setComment}
                editable={!isCaseClosed}
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  disabled={isCaseClosed || actionLoading}
                  onPress={() => updateStatus('In Progress')}
                >
                  <Text style={styles.actionButtonText}>In Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  disabled={isCaseClosed || actionLoading}
                  onPress={() => updateStatus('Resolved')}
                >
                  <Text style={styles.actionButtonText}>Resolve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={isCaseClosed || actionLoading}
                  onPress={() => updateStatus('Rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
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
  container: { flex: 1, backgroundColor: clr.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: clr.bg },

  header: {
    backgroundColor: clr.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: clr.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#B0D4F0', fontSize: 12 },
  

  statsScroll: { padding: 12 },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: 160,
    marginRight: 12,
    elevation: 3,
  },
  statIcon: { marginBottom: 8 },
  statLabel: { fontSize: 12, color: clr.muted, fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: '800' },

  filterContainer: { padding: 12, backgroundColor: '#fff' },
  filterRow: { flexDirection: 'row', gap: 12 },
  filterItem: { flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: clr.hint, marginBottom: 6 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: clr.border,
    borderRadius: 8,
    padding: 12,
  },
  pickerText: { flex: 1, fontSize: 15 },
  clearBtn: { marginTop: 12, alignSelf: 'flex-start' },
  clearText: { color: clr.accent, fontWeight: '600' },

  listContent: { padding: 12 },
  complaintCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: clr.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontWeight: '700', fontSize: 16 },
  complaintTitle: { fontSize: 16, fontWeight: '600', marginVertical: 8 }, // Renamed to avoid conflict
  ward: { color: clr.muted, fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  date: { color: clr.muted, fontSize: 13 },

  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    backgroundColor: clr.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, padding: 16 },
  modalComplaintTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: clr.hint, marginBottom: 8 },
  details: { fontSize: 15, lineHeight: 22, color: clr.textMid, marginBottom: 20 },
  textArea: {
    borderWidth: 1,
    borderColor: clr.border,
    borderRadius: 10,
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  actionButtons: { marginTop: 20, gap: 12 },
  actionButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  resolveButton: { backgroundColor: clr.success },
  rejectButton: { backgroundColor: '#FF5252' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: clr.muted, fontSize: 16 },
  countText: {
  marginTop: 10,
  fontSize: 12,
  color: '#6B7C93',
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

select: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: clr.border,
  borderRadius: 10,
  padding: 12,
  marginHorizontal: 4,
},
pickerRow: { flexDirection: 'row', gap: 12 },

selectText: {
  fontSize: 14,
  color:'#1D1E22',
},
logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#C8DFF0",
  },
  logoutText: { fontWeight: "700", fontSize: 14 },
  
});