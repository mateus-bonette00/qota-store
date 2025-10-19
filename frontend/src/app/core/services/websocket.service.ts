import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment'; // ajuste se necessário
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket?: Socket;

  connect(): void {
    if (!this.socket) {
      this.socket = io(environment.wsUrl, {
        transports: ['websocket'],
        withCredentials: false,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] conectado:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] desconectado:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.error('[WebSocket] erro de conexão:', err?.message || err);
      });
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  emit<T>(event: string, data?: T): void {
    this.socket?.emit(event, data);
  }

  on<T>(event: string, handler: (data: T) => void): void {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) this.socket?.off(event, handler);
    else this.socket?.removeAllListeners(event);
  }

  fromEvent<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const listener = (data: T) => subscriber.next(data);
      this.on<T>(event, listener);
      return () => this.off(event, listener);
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
