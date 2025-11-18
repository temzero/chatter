// src/services/api/rawApi.ts
import { EnvConfig } from "@/common/config/env.config";
import axios from "axios";

const rawAPI = axios.create({
  baseURL: EnvConfig.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default rawAPI;
