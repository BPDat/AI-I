import { useEffect, useRef, useState, useCallback } from "react";
import { blobToArrayBuffer, pickSupportedMimeType } from "../utils/audio";

type RecorderState = "idle" | "recording" | "paused" | "denied" | "error";

export function useRecorder(onChunk: (buf: ArrayBuffer) => void) {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | undefined>(undefined);

  const init = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      mediaStreamRef.current = stream;

      const mt = pickSupportedMimeType();
      setMimeType(mt);

      const rec = new MediaRecorder(
        stream,
        mt ? { mimeType: mt, audioBitsPerSecond: 128000 } : undefined,
      );
      recorderRef.current = rec;

      rec.ondataavailable = async (e: BlobEvent) => {
        if (!e.data || e.data.size === 0) return;
        const buf = await blobToArrayBuffer(e.data);
        onChunk(buf);
      };
      rec.onerror = (ev) => {
        console.error("Recorder error:", ev);
        setError("Recorder error");
        setState("error");
      };

      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err?.name === "NotAllowedError") setState("denied");
      else setState("error");
      setError(err?.message ?? "Mic init failed");
    }
  }, [onChunk]);

  const start = useCallback(async () => {
    if (!recorderRef.current) await init();
    if (!recorderRef.current) return;

    recorderRef.current.start(150);
    setState("recording");
  }, [init]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    mediaStreamRef.current = null;
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      recorderRef.current?.stop();
    };
  }, []);

  return { state, error, start, stop, mimeType };
}
