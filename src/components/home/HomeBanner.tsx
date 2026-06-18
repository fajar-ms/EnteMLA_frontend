import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import axios from "axios";


export default function HomeBanner() {
  const { width } = useWindowDimensions();
  const carouselWidth = width - 64; // Adjust if parent has 16px padding on each side
  const carouselHeight = carouselWidth / 1.77;
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/banner`
      );
      setBanners(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <Carousel
        width={carouselWidth}
        height={carouselHeight}
        data={banners}
        loop
        autoPlay
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            {/* <View style={styles.legend}>
              <Text style={styles.legendText}>{item.title}</Text>
            </View> */}
          </View>
        )}
      />

      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },

  carouselItem: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
  },

  legend: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  legendText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 20,
    backgroundColor: "#2563EB",
  },
});