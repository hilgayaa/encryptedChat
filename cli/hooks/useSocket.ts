"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth"; // your auth hook

export const useSocket = (chatId?: string) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return; // wait for token

    const socket = io("http://localhost:8000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
      if (chatId) socket.emit("joinChat", chatId); // join room
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [token, chatId]);

  return socketRef.current;
};
