import { useEffect, useState } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HomeBanner = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/banner`
            );

            setBanners(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    if (!banners.length) return null;

    return (
        <div className="home-banner-container">
            <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={4000}
            >
                {banners.map((banner) => (
                    <div key={banner._id} className="carousel-item-wrapper">
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="banner-image"
                        />
                        <p className="custom-legend">
                            {banner.title}
                        </p>
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default HomeBanner;