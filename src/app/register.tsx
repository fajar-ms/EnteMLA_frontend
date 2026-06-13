
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const districts = [
  {
    label: "Ernakulam",
    value: "ernakulam",
  },
  {
    label: "Kottayam",
    value: "kottayam",
  },
];

const constituencyMap: {
  [key: string]: {
    value: string;
    label: string;
  }[];
} = {
  ernakulam: [
    {
      value: "kochi",
      label: "Kochi",
    },
    {
      value: "thrikkakara",
      label: "Thrikkakara",
    },
  ],

  kottayam: [
    {
      value: "kottayam",
      label: "Kottayam",
    },
    {
      value: "pala",
      label: "Pala",
    },
  ],
};

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    constituencyId: "",
    place: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [showSuccessPopup, setShowSuccessPopup] =
    useState(false);

  const handleChange = (
    field: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "district"
        ? { constituencyId: "" }
        : {}),
    }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert(
        "Error",
        "Passwords do not match"
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowSuccessPopup(true);
    }, 1500);
  };

  return (
    <ImageBackground
      source={{
        uri: "https://i.postimg.cc/xC3v5cLV/2.png",
      }}
      style={styles.page}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backText}>
              ← Back to Home
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.logo}>
              Ente
              <Text style={styles.logoAccent}>
                MLA
              </Text>
            </Text>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Secure Digital Governance Portal
            </Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                Citizen Registration
              </Text>
            </View>

            <View style={styles.accentBar} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputBox}>
              <Ionicons
                name="person"
                size={18}
                color="#0e7490"
              />
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={form.name}
                onChangeText={(text) =>
                  handleChange("name", text)
                }
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons
                name="call"
                size={18}
                color="#0e7490"
              />
              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                style={styles.input}
                value={form.phone}
                onChangeText={(text) =>
                  handleChange("phone", text)
                }
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons
                name="mail"
                size={18}
                color="#0e7490"
              />
              <TextInput
                placeholder="Email Address"
                style={styles.input}
                value={form.email}
                keyboardType="email-address"
                onChangeText={(text) =>
                  handleChange("email", text)
                }
              />
            </View>

            <View style={styles.inputBox}>
              <Picker
                selectedValue={form.district}
                style={{ flex: 1 }}
                onValueChange={(value) =>
                  handleChange(
                    "district",
                    value
                  )
                }
              >
                <Picker.Item
                  label="Select District"
                  value=""
                />

                {districts.map((district) => (
                  <Picker.Item
                    key={district.value}
                    label={district.label}
                    value={district.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.inputBox}>
              <Picker
                selectedValue={
                  form.constituencyId
                }
                enabled={!!form.district}
                style={{ flex: 1 }}
                onValueChange={(value) =>
                  handleChange(
                    "constituencyId",
                    value
                  )
                }
              >
                <Picker.Item
                  label="Select Constituency"
                  value=""
                />

                {(
                  constituencyMap[
                    form.district
                  ] || []
                ).map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.inputBox}>
              <Ionicons
                name="navigate"
                size={18}
                color="#0e7490"
              />
              <TextInput
                placeholder="Place"
                style={styles.input}
                value={form.place}
                onChangeText={(text) =>
                  handleChange("place", text)
                }
              />
            </View>

            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed"
                size={18}
                color="#0e7490"
              />

              <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry={
                  !showPassword
                }
                value={form.password}
                onChangeText={(text) =>
                  handleChange(
                    "password",
                    text
                  )
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off"
                      : "eye"
                  }
                  size={20}
                  color="#0e7490"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed"
                size={18}
                color="#0e7490"
              />

              <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry={
                  !showConfirmPassword
                }
                value={
                  form.confirmPassword
                }
                onChangeText={(text) =>
                  handleChange(
                    "confirmPassword",
                    text
                  )
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-off"
                      : "eye"
                  }
                  size={20}
                  color="#0e7490"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text style={styles.buttonText}>
                  Create Account →
                </Text>
              )}
            </TouchableOpacity>

          </View>
          
        </View>
      </ScrollView>

      <Modal
        visible={showSuccessPopup}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Ionicons
              name="checkmark-circle"
              size={70}
              color="#14b8a6"
            />

            <Text style={styles.successText}>
              Registration Successful
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setShowSuccessPopup(false);
                router.replace("/");
              }}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor:
      "rgba(255,255,255,0.75)",
    borderRadius: 28,
    padding: 24,
  },

  backText: {
    color: "#64748b",
    marginBottom: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    fontSize: 22,
    fontWeight: "700",
  },

  logoAccent: {
    color: "#0e7490",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
  },

  subtitle: {
    color: "#64748b",
    marginTop: 5,
  },

  roleBadge: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor:
      "rgba(20,184,166,0.1)",
  },

  roleText: {
    color: "#0e7490",
  },

  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: "#38bdf8",
    marginTop: 16,
    borderRadius: 999,
  },

  form: {
    gap: 12,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 15,
    minHeight: 52,
  },

  input: {
    flex: 1,
    marginLeft: 10,
  },

  button: {
    backgroundColor: "#0e7490",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(0,0,0,0.4)",
  },

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  successText: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 15,
  },
});