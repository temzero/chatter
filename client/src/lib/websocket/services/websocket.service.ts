// src/services/websocket/websocket.service.ts
import { io, Socket } from "socket.io-client";
import { localStorageService } from "@/services/storage/localStorageService";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_API_URL || "ws://localhost:3000";

export class WebSocketService {
  private socket: Socket | null = null;
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
        // console.log("Connected to WebSocket, socketId: ", this.socket?.id);
        resolve(this.socket as Socket);
      });

      this.socket.on("connect_error", (error: unknown) => {
        // console.error("Connection error:", error);
        toast.error("WebSocket connection failed!");
        this.connectionPromise = null;
        reject(error);
      });

      this.socket.on("disconnect", () => {
        // console.log("Disconnected from WebSocket");
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

  // Helper method to emit events with proper typing
  emit<T>(event: string, data: T, callback?: (response: unknown) => void) {
    if (!this.socket) {
      console.warn("Socket not connected. Cannot emit event:", event);
      return;
    }
    if (callback) {
      this.socket.emit(event, data, callback); // Send with callback
    } else {
      this.socket.emit(event, data); // Send without callback
    }
  }

  // Helper method to listen to events
  on<T>(event: string, callback: (data: T) => void) {
    if (!this.socket) {
      console.warn("Socket not connected. Cannot listen to event:", event);
      return;
    }
    this.socket.on(event, callback);
  }

  // Helper method to remove event listeners
  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (!this.socket) {
      console.warn(
        "Socket not connected. Cannot remove listener for event:",
        event
      );
      return;
    }

    if (callback) {
      // Remove specific callback for the event
      this.socket.off(event, callback);
    } else {
      // Remove all listeners for the event
      this.socket.off(event);
    }
  }
}

// Single instance for the entire application
export const webSocketService = new WebSocketService();
