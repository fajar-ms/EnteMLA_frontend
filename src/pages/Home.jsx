import React from "react";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import Trending from "../components/home/Trending";
import MyMlaCard from "../components/home/MyMlaCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
      <Trending />

    </div>
  );
};

export default Home;