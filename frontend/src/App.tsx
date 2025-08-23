import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";
import { useRecorder } from "./hooks/useRecorder";
import { useCallback, useState } from "react";
import MicButton from "./components/MicButton/MicButton";
import TranscriptBox from "./components/TranscriptBox/TranscriptBox";

function App() {
  const { connected, transcript, emitControl, emitAudioChunk } = useWebSocket();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const onChunk = useCallback(
    (buf: ArrayBuffer) => {
      emitAudioChunk(buf);
    },
    [emitAudioChunk],
  );

  const { state, error, start, stop, mimeType } = useRecorder(onChunk);

  const toggleRecord = async () => {
    if (!sessionId) {
      const id = crypto.randomUUID();
      setSessionId(id);
      emitControl({
        type: "START_SESSION",
        sessionId: id,
      });
    }
    if (state === "recording") {
      stop();
      emitControl({ type: "STOP_SESSION" });
      setSessionId(null);
    } else {
      await start();
    }
  };

  const interrupt = () => {
    emitControl({ type: "INTERRUPT" });
  };

  return (
    <div className="app-container">
      <h1 className="app-title">AI Interview Realtime – MVP</h1>

      <div className="app-status">
        <div>WS: {connected ? "Connected" : "Disconnected"}</div>
        <div>
          Recorder: {state}
          {mimeType ? ` (${mimeType})` : ""}
        </div>
        {error && <div className="app-error">Error: {error}</div>}
      </div>

      <div className="app-controls">
        <MicButton
          recording={state === "recording"}
          disabled={!connected || state === "denied"}
          onToggle={toggleRecord}
        />
        <button
          onClick={interrupt}
          disabled={!connected}
          className="interrupt-button"
        >
          INTERRUPT
        </button>
      </div>

      <TranscriptBox partial={transcript.partial} finals={transcript.finals} />
    </div>
  );
}

export default App;
