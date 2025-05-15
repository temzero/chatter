// src/services/api/rawApi.ts
import axios from "axios";

const rawAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default rawAPI;
