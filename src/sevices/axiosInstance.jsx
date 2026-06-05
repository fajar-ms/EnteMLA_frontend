// src/services/mlaAxiosInstance.js

import axios from "axios";

const mlaAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

mlaAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or mlaToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default mlaAxiosInstance;