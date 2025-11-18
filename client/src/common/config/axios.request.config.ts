import { InternalAxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isPublic?: boolean;
}
