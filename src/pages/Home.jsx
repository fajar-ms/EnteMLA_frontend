import React from "react";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import Trending from "../components/home/Trending";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
    const navigate = useNavigate();
        const { t } = useTranslation();
  return (
    <div>
      <Navbar />
      <Hero />
      <Stats/>
      <Trending />
      
    </div>
  );
};

export default Home;