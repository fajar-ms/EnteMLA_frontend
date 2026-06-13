import React, { useEffect, useState } from "react";
import Swiper from "react-native-swiper";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";


const { width } = Dimensions.get("window");

const HomeBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);

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
      <Swiper
        autoplay
        autoplayTimeout={4}
        showsPagination
      >
        {banners.map((banner) => (
          <View
            key={banner._id}
            style={styles.carouselItem}
          >
            <Image
              source={{ uri: banner.imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.legend}>
              <Text style={styles.legendText}>
                {banner.title}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 16,
    paddingHorizontal: 16,
  },

  carouselItem: {
    width: "100%",
    height: width / 1.77,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    overflow: "hidden",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
  },

  legend: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  legendText: {
    color: "#fff",
    fontWeight: "600",
  },
});
export default HomeBanner;