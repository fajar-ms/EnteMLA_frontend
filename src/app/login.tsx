// src/app/login.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const LoginPage = () => {
    const router = useRouter();
    const { t } = useTranslation();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const role = 'citizen'; // Will be set from storage / previous screen

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            const savedRole = await AsyncStorage.getItem('role');

            if (!savedRole) {
                router.replace('/');
                return;
            }
            if (token) {
                router.replace('/');
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');

        const selectedRole = await AsyncStorage.getItem('role');

        if (!selectedRole) {
            Alert.alert('Error', 'Please select a role first');
            router.push('/');
            return;
        }

        try {
            let endpoint = '';
            let payload: any = {};

            if (selectedRole === 'citizen') {
                endpoint = '/auth/login';
                payload = { email: identifier, password };
            } else if (selectedRole === 'mla') {
                endpoint = '/auth/mla/login';
                payload = { mlaId: identifier, password };
            } else if (selectedRole === 'employee') {
                endpoint = '/auth/employee/login';
                payload = { employeeId: identifier, password };
            }
console.log("API:", process.env.EXPO_PUBLIC_API_BASE_URL);
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}`,
                payload
            );

            if (response.status === 200 || response.status === 201) {
                const { user: userData, token } = response.data;

                if (userData && token) {
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                    await AsyncStorage.setItem('role', selectedRole);
                    await AsyncStorage.setItem('token', token);

                    router.replace('/');
                }
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.loginCard}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#0f766e" />
                    <Text style={styles.backText}>Back to Home</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>
                        Ente<Text style={styles.logoSpan}>MLA</Text>
                    </Text>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Secure Digital Governance Portal</Text>

                    <View style={styles.roleBadge}>
                        <Ionicons
                            name={role === 'citizen' ? 'person' : role === 'mla' ? 'briefcase' : 'construct'}
                            size={18}
                            color="#0c2f47"
                        />
                        <Text style={styles.roleText}>
                            {role === 'citizen' ? 'Citizen Login' : role === 'mla' ? 'MLA Login' : 'Employee Login'}
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {role === 'citizen' ? 'Email Address' : role === 'mla' ? 'MLA ID' : 'Employee ID'}
                        </Text>
                        <View style={styles.inputBox}>
                            <Ionicons name="mail" size={20} color="#14b8a6" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={
                                    role === 'citizen'
                                        ? 'Enter your email'
                                        : role === 'mla'
                                        ? 'Enter your MLA ID'
                                        : 'Enter your Employee ID'
                                }
                                value={identifier}
                                onChangeText={setIdentifier}
                                autoCapitalize="none"
                                keyboardType={role === 'citizen' ? 'email-address' : 'default'}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputBox}>
                            <Ionicons name="lock-closed" size={20} color="#14b8a6" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#0369a1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginBtnText}>Sign In →</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {role === 'citizen' && (
                    <TouchableOpacity onPress={() => router.push('/register')}>
                        <Text style={styles.registerLink}>
                            Not registered? <Text style={styles.registerHighlight}>Register</Text>
                        </Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.footer}>© 2026 Digital Governance Initiative</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f0feff',
        justifyContent: 'center',
        padding: 20,
    },
    loginCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 30,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.6)',
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    backText: {
        color: '#0f766e',
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0c2f47',
        marginBottom: 10,
    },
    logoSpan: {
        color: '#14b8a6',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0c2f47',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#0f766e',
        marginBottom: 16,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(20,184,166,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.5)',
    },
    roleText: {
        fontWeight: '700',
        color: '#0c2f47',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0c2f47',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9ffff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
    },
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 16,
        color: '#0c2f47',
    },
    eyeIcon: {
        paddingRight: 16,
    },
    loginBtn: {
        backgroundColor: '#14b8a6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    loginBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    registerLink: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 15,
        color: '#64748b',
    },
    registerHighlight: {
        color: '#14b8a6',
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        marginTop: 30,
        color: '#64748b',
        fontSize: 13,
    },
});

export default LoginPage;