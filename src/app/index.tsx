// src/app/index.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Trending from '../components/home/Trending';

const Home = () => {
    console.log("HOME RENDER");

    return (
        <View style={styles.container}>
            <Navbar />

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Hero />
                <Trending />
                
                {/* Add more sections here later */}
                {/* <Categories /> */}
                {/* <Popular /> */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 80,   // Extra space at bottom
    },
    sectionSpacing: {
        marginBottom: 30,
    },
});

export default Home;