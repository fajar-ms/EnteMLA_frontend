// src/app/register.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Dimensions,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const constituencyMap: { [key: string]: { value: string; label: string }[] } = {
    thiruvananthapuram: [
        { value: "kovalam", label: "Kovalam" },
        { value: "vattiyoorkavu", label: "Vattiyoorkavu" },
        { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
    ],
    ernakulam: [
        { value: "aluva", label: "Aluva" },
        { value: "kalamassery", label: "Kalamassery" },
        { value: "thrippunithura", label: "Thrippunithura" },
    ],
    // Add other districts as needed...
};

const Register = () => {
    const router = useRouter();
    const { t } = useTranslation();

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
            ...(field === "district" ? { constituencyId: "" } : {})
        }));
    };

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                email: form.email,
                district: form.district,
                constituencyId: form.constituencyId,
                place: form.place,
                password: form.password,
                role: "citizen"
            };

            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register`,
                payload
            );

            if (response.status === 201 || response.status === 200) {
                setShowSuccessPopup(true);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Registration failed";
            Alert.alert("Registration Failed", Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.registerCard}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#0f766e" />
                    <Text style={styles.backText}>Back to Home</Text>
                </TouchableOpacity>

                {/* Header */}
                <Text style={styles.logo}>Ente<Text style={styles.logoSpan}>MLA</Text></Text>
                <Text style={styles.title}>Create Account</Text>
                <View style={styles.roleBadge}>
                    <Ionicons name="person" size={20} color="#0c2f47" />
                    <Text style={styles.roleText}>Citizen Registration</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Ionicons name="person" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={form.name}
                            onChangeText={(text) => handleChange('name', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Ionicons name="call" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={form.phone}
                            onChangeText={(text) => handleChange('phone', text)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Ionicons name="mail" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={form.email}
                            onChangeText={(text) => handleChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* District */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="location" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Select District"
                            value={form.district}
                            onChangeText={(text) => handleChange('district', text.toLowerCase())}
                        />
                    </View>

                    {/* Constituency */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="business" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Select Constituency"
                            value={form.constituencyId}
                            onChangeText={(text) => handleChange('constituencyId', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Ionicons name="navigate" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Your Location / Place"
                            value={form.place}
                            onChangeText={(text) => handleChange('place', text)}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={form.password}
                            onChangeText={(text) => handleChange('password', text)}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#0369a1" />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed" size={20} color="#14b8a6" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#0369a1" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.registerBtn} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.registerBtnText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.signinLink}>
                        Already registered? <Text style={styles.signinHighlight}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Success Popup */}
            <Modal visible={showSuccessPopup} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View style={styles.popup}>
                        <Ionicons name="checkmark-circle" size={60} color="#14b8a6" />
                        <Text style={styles.popupTitle}>Registration Successful!</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={() => {
                            setShowSuccessPopup(false);
                            router.replace('/');
                        }}>
                            <Text style={styles.popupButtonText}>Continue to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f0feff',
        padding: 20,
    },
    registerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.6)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    backText: { color: '#0f766e', fontWeight: '600' },
    logo: { fontSize: 32, fontWeight: '900', color: '#0c2f47', textAlign: 'center' },
    logoSpan: { color: '#14b8a6' },
    title: { fontSize: 26, fontWeight: '800', color: '#0c2f47', textAlign: 'center', marginVertical: 12 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'rgba(20,184,166,0.15)',
        padding: 12,
        borderRadius: 30,
        marginBottom: 24,
    },
    roleText: { fontWeight: '700', color: '#0c2f47', fontSize: 16 },
    form: { gap: 16 },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9ffff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
    },
    icon: { paddingLeft: 16 },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 16,
        color: '#0c2f47',
    },
    eyeIcon: { paddingRight: 16 },
    registerBtn: {
        backgroundColor: '#14b8a6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    registerBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    signinLink: {
        textAlign: 'center',
        marginTop: 20,
        color: '#64748b',
        fontSize: 15,
    },
    signinHighlight: {
        color: '#14b8a6',
        fontWeight: '700',
    },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '85%',
        borderWidth: 2,
        borderColor: '#14b8a6',
    },
    popupTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0c2f47',
        marginVertical: 16,
        textAlign: 'center',
    },
    popupButton: {
        backgroundColor: '#14b8a6',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginTop: 10,
    },
    popupButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default Register;