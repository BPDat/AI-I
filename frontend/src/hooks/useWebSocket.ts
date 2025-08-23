import { useCallback, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

export type TranscriptMsg =
  | { type: "TRANSCRIPT_PARTIAL"; text: string }
  | { type: "TRANSCRIPT_FINAL"; text: string };

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState<{
    partial: string;
    finals: string[];
  }>({
    partial: "",
    finals: [],
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL, {
      path: "/realtime",
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.onAny((event, data) => {
      if (import.meta.env.DEV) console.log("[WS]", event, data);
    });

    socket.on("transcript", (msg: TranscriptMsg) => {
      if (msg.type === "TRANSCRIPT_PARTIAL") {
        setTranscript((t) => ({ ...t, partial: msg.text }));
      } else if (msg.type === "TRANSCRIPT_FINAL") {
        setTranscript((t) => ({
          partial: "",
          finals: [...t.finals, msg.text],
        }));
      }
    });

    return () => {
      socket.disconnect;
    };
  }, []);

  const emitControl = useCallback((payload: any) => {
    socketRef.current?.emit("control", payload);
  }, []);

  const emitAudioChunk = useCallback((buf: ArrayBuffer | Uint8Array | Blob) => {
    socketRef.current?.emit("audio", buf);
  }, []);

  return {
    socket: socketRef,
    connected,
    transcript,
    emitControl,
    emitAudioChunk,
    setTranscript,
  };
}
