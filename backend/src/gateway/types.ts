// Control messages từ client
export type clientControlMessage =
  | { type: 'START_SESSION'; sessionId: string }
  | { type: 'STOP_SESSION' }
  | { type: 'INTERRUPT' };
// Audio binary (ArrayBuffer → Buffer khi tới backend)
export type clientAudioMessage = Buffer;

// Server → Client
export type ServerMessage =
  | { type: 'SESSION_STARTED'; sessionId: string }
  | { type: 'SESSION_STOPPED'; sessionId: string }
  | { type: 'INTERRUPTED' }
  | { type: 'TRANSCRIPT_PARTIAL'; text: string }
  | { type: 'TRANSCRIPT_FINAL'; text: string }
  | { type: 'AI_REPLY_PARTIAL'; text: string }
  | { type: 'AI_REPLY_FINAL'; text: string }
  | { type: 'AI_AUDIO_CHUNK'; data: ArrayBuffer }
  | { type: 'AI_AUDIO_END' };
