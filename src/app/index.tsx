// src/app/index.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats';
import Trending from '../components/home/Trending';

const Home = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Navbar />
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Hero />
                <View style={styles.sectionSpacing}>
        <Stats />
    </View>
                <View style={styles.sectionSpacing}>
        <Trending />
    </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,   // Extra breathing space at bottom
    },

    sectionSpacing: {
    marginBottom: 30,
},
});

export default Home;