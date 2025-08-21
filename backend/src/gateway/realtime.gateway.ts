import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { clientControlMessage } from './types';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
  path: '/realtime',
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnected: ${client.id}`);
  }
  // Nhận control message (JSON)
  @SubscribeMessage('control')
  onControl(
    @MessageBody() data: clientControlMessage,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('control message:', data);

    switch (data.type) {
      case 'START_SESSION':
        client.data.sessionId = data.sessionId;
        client.emit('server_ack', {
          type: 'SESSION_STARTED',
          sessionId: data.sessionId,
        });
        break;

      case 'STOP_SESSION':
        client.emit('server_ack', {
          type: 'SESSION_STOPPED',
          sessionId: client.data.sessionId,
        });
        break;

      case 'INTERRUPT':
        client.emit('server_ack', { type: 'INTERRUPTED' });
        break;
      default:
        console.log(`Unknown control type: ${(data as any).type}`);
    }
  }
  // Nhận audio chunk (binary)
  @SubscribeMessage('audio')
  onAudio(@MessageBody() chunl: Buffer, @ConnectedSocket() client: Socket) {
    console.log(
      `Audio chunk received: ${EncodedAudioChunk.length} bytes (from ${client.id})`,
    );
    // Tạm thời echo lại → sau này sẽ gửi transcript
    client.emit('transcript', {
      type: 'TRANSCRIPT_PARTIAL',
      text: '[dummy transcript]',
    });
  }
}
