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
      <View style={styles.header}>
        <View style={styles.profileMain}>
          <Image
            source={{ uri: mla.photo }}
            style={styles.photo}
          />

          <View style={styles.headerContent}>
            <Text style={styles.badge}>
              {mla.party}
            </Text>

            <Text style={styles.pretitle}>
              Your MLA
            </Text>

            <Text style={styles.name}>
              {mla.name}
            </Text>

            <Text style={styles.constituency}>
              Constituency: {mla.constituencyId}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.info}>
          <Text style={styles.label}>
            Email Address
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`mailto:${mla.email}`)
            }
          >
            <Text style={styles.value}>
              {mla.email}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>
            Phone Number
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`tel:${mla.phone}`)
            }
          >
            <Text style={styles.value}>
              {mla.phone}
            </Text>
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
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
    marginBottom: 20,
  },

  profileMain: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  pretitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
  },

  constituency: {
    color: "#475569",
    marginTop: 4,
  },

  details: {
    marginTop: 20,
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