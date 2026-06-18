// src/app/index.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from "react-native";   // ✅ Correct
import { useTranslation } from 'react-i18next';

import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Trending from '../components/home/Trending';

const Home = () => {
    console.log("HOME RENDER");

    return (
        <View style={styles.container}>
            <Navbar />
            <Hero />
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    sectionSpacing: {
        marginBottom: 30,
    },
});

export default Home;