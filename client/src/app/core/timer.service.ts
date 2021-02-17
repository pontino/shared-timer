import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TimerStatusDto {
  status: 'running' | 'pause';
  seconds?: number;
}

export interface TimerData extends TimerStatusDto {
  level: 'manager' | 'viewer';
  room: string;
  forcePassword?: string;
}

@Injectable()
export class TimerService {

  private data$$ = new BehaviorSubject<TimerData>(null);
  data$ = this.data$$.asObservable();
  lastDisconnectReason: string;

  constructor(
    private socket: Socket
  ) {
    this.socket.fromEvent<TimerData>('role').subscribe(newRole => {
      if (newRole) {
        if (newRole.level === 'manager' || newRole.level === 'viewer') {
          // console.log('Im a ' + newRole.level);
          if (newRole.forcePassword) {
            sessionStorage.setItem('last-pass', newRole.forcePassword);
          }
          this.data$$.next(newRole);
        }
      } else {
        console.log('Im nothing.');
        this.data$$.next(null);
      }
    });

    this.socket.fromEvent<TimerData>('new-status').subscribe(newData => {
      if (this.data$$.value) {
        this.data$$.next({ ...this.data$$.value, ...newData });
      }
    });

    this.socket.on('connect', () => {
      this.lastDisconnectReason = '';
      if (sessionStorage.getItem('last-pass')) {
        this.sendPassword(sessionStorage.getItem('last-pass'));
      }
    });

    this.socket.on('disconnect', reason => {
      this.lastDisconnectReason = reason;
      // this.data$$.next(null);
    });
  }

  connect(): void {
    this.socket.connect();
  }

  getMessages$(): Observable<string> {
    return this.socket.fromEvent<string>('message');
  }

  sendPassword(pass: string): void {
    this.socket.connect();
    this.socket.emit('password', pass);
    sessionStorage.setItem('last-pass', pass);
  }

  simulateDisconnection(): void {
    this.socket.disconnect('Simulated disconnection');
  }

  simulateReconnection(): void {
    this.socket.connect();
  }

  setStatus(status: TimerStatusDto): void {
    this.socket.emit('set-status', status);
  }

  disconnect(): void {
    this.socket.disconnect('Logout');
    this.data$$.next(null);
  }
}
