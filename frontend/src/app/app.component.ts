import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from './core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(private ws: WebsocketService) {}

  ngOnInit(): void {
    // abre a conexão 1x para toda a app
    this.ws.connect();

    // exemplo de escuta global (remova se não precisar aqui)
    this.sub = this.ws.fromEvent<any>('finance-update').subscribe((data) => {
      console.log('[WS] finance-update:', data);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.ws.disconnect(); // opcional: se quiser encerrar ao destruir o AppComponent
  }
}
