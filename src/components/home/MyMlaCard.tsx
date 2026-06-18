import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MyMlaCard = () => {
  const [mla, setMla] = useState<any>(null);

  useEffect(() => {
    const fetchMla = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/my-mla`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMla(res.data);
      } catch (error) {
        console.log("Error fetching MLA:", error);
      }
    };

    const checkRole = async () => {
      const role = await AsyncStorage.getItem("role");

      if (role === "citizen" || role === "employee") {
        fetchMla();
      }
    };

    checkRole();
  }, []);

  if (!mla) return null;

  return (
    <View style={styles.card}>
      {/* Header Container: Holds Photo (Left) and Content Stack (Right) */}
      <View style={styles.header}>
        <View style={styles.profileMain}>

          {/* Left Column: Photo */}
          <Image
            source={{ uri: mla.photo }}
            style={styles.photo}
          />

          {/* Right Column: Party, Pretitle, Name, and Constituency */}
          <View style={styles.headerContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {mla.party}
              </Text>
            </View>

            <Text style={styles.pretitle}>
              Your MLA
            </Text>

            <Text style={styles.name} numberOfLines={3}>
              {mla.name}
            </Text>

            <Text style={styles.constituency}>
              Constituency: {mla.constituencyId}
            </Text>
          </View>

        </View>
      </View>

      {/* Details Section (Email & Phone) */}
      <View style={styles.details}>
        <View style={styles.info}>
          <Text style={styles.label}>Email Address</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${mla.email}`)}>
            <Text style={styles.value}>{mla.email}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Phone Number</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${mla.phone}`)}>
            <Text style={styles.value}>{mla.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 24,
    margin: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
    marginBottom: 20,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "flex-start", // Aligns the tops of the image and the text stack perfectly
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  headerContent: {
    marginLeft: 20,
    flex: 1, // Ensures the container fills the rest of the row and breaks text properly
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    maxWidth: '100%', // Keeps long party text from stretching past layout borders
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    flexWrap: 'wrap', // Forces long names to break into multiple lines exactly like ccccccccc.PNG
  },
  pretitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 4,
    lineHeight: 32,
    textTransform: "uppercase", // Matches the emphasis in the design image
  },
  constituency: {
    color: "#475569",
    fontWeight: "600",
    marginTop: 6,
    fontSize: 14,
    textTransform: "capitalize",
  },
  details: {
    marginTop: 10,
  },
  info: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
    marginTop: 4,
  },
});

export default MyMlaCard;