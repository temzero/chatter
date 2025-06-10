// src/services/websocket/websocket.service.ts
import { io, Socket } from "socket.io-client";
import { localStorageService } from "@/services/storage/localStorageService";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_API_URL || "ws://localhost:3000";

export class WebSocketService {
  protected socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;

  connect(): Promise<Socket> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: localStorageService.getAccessToken(),
        },
        withCredentials: true,
        transports: ["websocket"],
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        resolve(this.socket as Socket);
      });

      this.socket.on("connect_error", (error: unknown) => {
        console.error("Connection error:", error);
        toast.error("WebSocket connection failed!");
        this.connectionPromise = null;
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const webSocketService = new WebSocketService();
