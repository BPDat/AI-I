import {
  createClient,
  LiveTranscriptionEvents,
  LiveTranscriptionEvent,
  LiveClient,
  DeepgramClient,
} from '@deepgram/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type MyTranscriptEvent = LiveTranscriptionEvent;

@Injectable()
export class STTService {
  private deepgram: DeepgramClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPGRAM_API_KEY');
    if (!apiKey) throw new Error('Missing DEEPGRAM_API_KEY');
    this.deepgram = createClient(apiKey);
  }

  createRealtimeSTT(
    onTranscript: (text: string, isFinal: boolean) => void,
  ): LiveClient {
    const ws: LiveClient = this.deepgram.listen.live({
      punctuate: true,
      interim_results: true,
    });

    ws.addListener(
      LiveTranscriptionEvents.Transcript,
      (data: MyTranscriptEvent) => {
        if (data.is_final && data.channel && data.channel.alternatives) {
          const alternative = data.channel.alternatives[0];
          if (alternative) {
            onTranscript(alternative.transcript, data.is_final);
          }
        }
      },
    );

    return ws;
  }
}
