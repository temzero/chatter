// src/services/websocket.service.ts
import { io, Socket } from "socket.io-client";
import { localStorageService } from "../../services/storage/localStorageService";
import { MessageResponse } from "@/types/messageResponse";
import { toast } from "react-toastify";

// const SOCKET_URL = import.meta.env.REACT_APP_WS_URL || "ws://localhost:3001";
const SOCKET_URL = "http://localhost:3000";

class WebSocketService {
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;

  connect(): Promise<Socket> {
    if (this.connectionPromise) return this.connectionPromise;
    console.log('connect with accessToken', localStorageService.getAccessToken())
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
        // handleError(error, "Websocket connection failed!");
        toast.error("Websocket connection failed!");
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

  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit("joinChat", chatId);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit("leaveChat", chatId);
    }
  }

  sendMessage(chatId: string, message: MessageResponse) {
    if (this.socket) {
      this.socket.emit("sendMessage", { chatId, message });
    }
  }

  onNewMessage(
    callback: (data: {
      chatId: string;
      message: MessageResponse;
      senderId: string;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }

  offNewMessage(
    callback: (data: {
      chatId: string;
      message: MessageResponse;
      senderId: string;
    }) => void
  ) {
    if (this.socket) {
      this.socket.off("newMessage", callback);
    }
  }

  // Add online status methods
  onUserOnlineStatus(
    callback: (data: { userId: string; online: boolean }) => void
  ) {
    if (this.socket) {
      this.socket.on("userOnline", callback);
    }
  }

  offUserOnlineStatus(
    callback: (data: { userId: string; online: boolean }) => void
  ) {
    if (this.socket) {
      this.socket.off("userOnline", callback);
    }
  }
}

export const webSocketService = new WebSocketService();
