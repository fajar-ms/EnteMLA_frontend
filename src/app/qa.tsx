// src/app/qa.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Navbar from '../components/home/Navbar';

const { width } = Dimensions.get('window');

const QA = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<any[]>([]);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    const resultsRef = useRef<ScrollView>(null);

    const translatedFaqs = [
        { id: 1, question: t("faq_q1"), answer: t("faq_a1") },
        { id: 2, question: t("faq_q2"), answer: t("faq_a2") },
        { id: 3, question: t("faq_q3"), answer: t("faq_a3") },
    ];

    const ask = async (customQuestion?: string) => {
        const question = (customQuestion || input).trim();
        if (!question || loading) return;

        setInput("");
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/ai/chat`, {
                question,
                lang: "en", // You can make this dynamic
            });

            setAnswers(prev => [{
                id: Date.now(),
                question,
                answer: res.data.answer,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, ...prev]);
        } catch (err) {
            console.error(err);
            // You can show an alert here
        } finally {
            setLoading(false);
            setTimeout(() => {
                resultsRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    };

    return (
       <ImageBackground
        source={{ uri: "https://i.postimg.cc/xC3v5cLV/2.png" }}
        style={styles.container}
        resizeMode="cover"
    >
        <View style={styles.overlay} />

        <Navbar />

        <ScrollView
            contentContainerStyle={styles.scrollContent}
            ref={resultsRef}
            showsVerticalScrollIndicator={false}
        >
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>{t("community_qa")}</Text>
                    <Text style={styles.heroSubtitle}>{t("qa_subtitle")}</Text>
                </View>

                {/* Input Box */}
                <View style={styles.inputContainer}>
                    <View style={styles.askBox}>
                        <TextInput
                            style={styles.input}
                            placeholder={t("type_question")}
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={() => ask()}
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.sendButton} 
                            onPress={() => ask()}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="send" size={22} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingDots}>
                            <View style={styles.dot} />
                            <View style={[styles.dot, { animationDelay: '0.2s' }]} />
                            <View style={[styles.dot, { animationDelay: '0.4s' }]} />
                        </View>
                        <Text style={styles.typingText}>{t("ai_thinking")}</Text>
                    </View>
                )}

                {/* Answers */}
                <View style={styles.answersContainer}>
                    {answers.map((item, index) => (
                        <View key={item.id} style={styles.answerCard}>
                            <View style={styles.questionRow}>
                                <View style={styles.qChip}><Text style={styles.chipText}>Q</Text></View>
                                <Text style={styles.questionText}>{item.question}</Text>
                            </View>

                            <View style={styles.answerRow}>
                                <View style={styles.aChip}><Text style={styles.chipText}>A</Text></View>
                                <Text style={styles.answerText}>{item.answer}</Text>
                            </View>

                            <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                    ))}
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.faqSubtitle}>{t("faq")}</Text>
                    <Text style={styles.faqTitle}>{t("frequently_asked_questions")}</Text>

                    {translatedFaqs.map((faq) => (
                        <View key={faq.id} style={styles.faqItem}>
                            <TouchableOpacity 
                                style={styles.faqTrigger}
                                onPress={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                            >
                                <Text style={styles.faqQuestion}>{faq.question}</Text>
                                <Ionicons 
                                    name={openFaqId === faq.id ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#14b8a6" 
                                />
                            </TouchableOpacity>

                            {openFaqId === faq.id && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.answerText}>{faq.answer}</Text>
                                    <TouchableOpacity 
                                        style={styles.askAiBtn}
                                        onPress={() => ask(faq.question)}
                                    >
                                        <Text style={styles.askAiText}>{t("ask_ai")}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, },
    overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
},
    scrollContent: { paddingBottom: 60 },
    hero: {
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
},
    heroTitle: { fontSize: 36, fontWeight: '800', color: '#0c2f47', textAlign: 'center' },
    heroSubtitle: { fontSize: 18, color: '#0f766e', textAlign: 'center', marginTop: 12 },

    inputContainer: { paddingHorizontal: 20, marginTop: 20 },
    askBox: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.4)',
        padding: 8,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        maxHeight: 120,
    },
    sendButton: {
        backgroundColor: '#14b8a6',
        padding: 14,
        borderRadius: 14,
        marginLeft: 8,
    },

    typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 16 },
    typingDots: { flexDirection: 'row', marginRight: 12 },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: '#14b8a6',
        borderRadius: 4,
        marginHorizontal: 2,
    },
    typingText: { color: '#0f766e', fontWeight: '600' },

    answersContainer: { paddingHorizontal: 20, gap: 16, marginTop: 10 },
    answerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    questionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    qChip: {
        width: 28,
        height: 28,
        backgroundColor: '#14b8a6',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aChip: {
        width: 28,
        height: 28,
        backgroundColor: '#0f766e',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: { color: 'white', fontWeight: '800', fontSize: 12 },
    questionText: { fontWeight: '700', color: '#0c2f47', flex: 1 },
    answerRow: { flexDirection: 'row', gap: 12, backgroundColor: '#f0feff', padding: 16, borderRadius: 14 },
    answerText: { color: '#334155', lineHeight: 22, flex: 1 },
    timeText: { textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 8 },

    faqSection: { padding: 20, marginTop: 30 },
    faqSubtitle: { color: '#14b8a6', fontWeight: '700', textAlign: 'center' },
    faqTitle: { fontSize: 24, fontWeight: '800', color: '#0c2f47', textAlign: 'center', marginVertical: 12 },
    faqItem: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(20,184,166,0.3)',
    },
    faqTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    faqQuestion: { fontSize: 16, fontWeight: '600', color: '#0c2f47', flex: 1 },
    faqAnswer: { padding: 18, paddingTop: 0 },
    askAiBtn: {
        marginTop: 12,
        backgroundColor: '#14b8a6',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    askAiText: { color: 'white', fontWeight: '700' },
});

export default QA;