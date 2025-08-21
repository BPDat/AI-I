import { Injectable } from '@nestjs/common';

interface SessionState {
  id: string;
  interreupted: boolean;
  createdAt: number;
}

@Injectable()
export class SessionService {
  private seesions = new Map<string, SessionState>();

  createSession(id: string) {
    const session: SessionState = {
      id,
      interreupted: false,
      createdAt: Date.now(),
    };
    this.seesions.set(id, session);
    return session;
  }

  stopSession(id: string) {
    return this.seesions.delete(id);
  }

  interruptSession(id: string) {
    const s = this.seesions.get(id);
    if (s) s.interreupted = true;
  }

  getSession(id: string) {
    return this.seesions.get(id);
  }
}
