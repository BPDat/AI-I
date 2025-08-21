import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateway/realtime.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [RealtimeGateway],
})
export class AppModule {}
