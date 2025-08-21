import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const socketRef = useWebSocket();

  const startSession = () => {
    socketRef.current?.emit("control", {
      type: "START_SESSION",
      sessionId: "test123",
    });
  };

  return (
    <>
      <h1>AI Interview Realtime</h1>
      <button onClick={startSession}>Start Session</button>
    </>
  );
}

export default App;
