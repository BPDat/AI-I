import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL, {
      path: "/realtime",
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("WS connected", socket.id));
    socket.on("disconnect", () => console.log("WS disconnected"));
    socket.onAny((event, data) => {
      console.log("Server event: ", event, data);
    });

    return () => {
      socket.disconnect;
    };
  }, []);
  return socketRef;
}
