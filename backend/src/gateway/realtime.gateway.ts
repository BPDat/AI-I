import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import type { clientControlMessage } from './types';
import { STTService } from 'src/stt/stt.service';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
  path: '/realtime',
})
export class RealtimeGateway {
  constructor(private readonly sttService: STTService) {}
  private sessions: Map<string, any> = new Map();

  @SubscribeMessage('control')
  async onControl(
    @MessageBody() data: clientControlMessage,
    @ConnectedSocket() client: Socket,
  ) {
    switch (data.type) {
      case 'START_SESSION':
        client.data.sessionId = data.sessionId;
        const sttWS = await this.sttService.createRealtimeSTT(
          (text, isFinal) => {
            client.emit('transcript', {
              type: isFinal ? 'TRANSCRIPT_FINAL' : 'TRANSCRIPT_PARTIAL',
              text,
            });
          },
        );

        this.sessions.set(data.sessionId, { sttWS });
        client.emit('server_ack', {
          type: 'SESSION_STARTED',
          sessionId: data.sessionId,
        });
        break;

      case 'STOP_SESSION':
        const sess = this.sessions.get(client.data.sessionId);
        if (sess?.sttWS) sess.sttWS.finish(); // close STT WS
        this.sessions.delete(client.data.sessionId);
        client.emit('server_ack', {
          type: 'SESSION_STOPPED',
          sessionId: client.data.sessionId,
        });
        break;

      case 'INTERRUPT':
        const s = this.sessions.get(client.data.sessionId);
        if (s?.sttWS) s.sttWS.cancel();
        client.emit('server_ack', { type: 'INTERRUPTED' });
        break;
      default:
        console.log(`Unknown control type: ${(data as any).type}`);
    }
  }

  @SubscribeMessage('audio')
  async onAudio(
    @MessageBody() chunk: Buffer,
    @ConnectedSocket() client: Socket,
  ) {
    const sess = await this.sessions.get(client.data.sessionId);
    // Tạm thời echo lại → sau này sẽ gửi transcript
    client.emit('transcript', {
      type: 'TRANSCRIPT_PARTIAL',
      text: '[dummy transcript]',
    });
  }
}
