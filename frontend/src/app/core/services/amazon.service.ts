import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AmazonBalance {
  disponivel: number;
  pendente: number;
  moeda: string;
  data?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AmazonService {
  private apiUrl = environment.apiUrl;
  private balanceSubject = new BehaviorSubject<AmazonBalance | null>(null);
  public balance$ = this.balanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Buscar saldo Amazon (cache ou forçar refresh)
   */
  getBalance(forceRefresh: boolean = false): Observable<AmazonBalance> {
    const params = forceRefresh ? { force_refresh: 'true' } : {};

    return this.http.get<AmazonBalance>(`${this.apiUrl}/amazon/saldos/latest`, { params })
      .pipe(
        tap(balance => this.balanceSubject.next(balance))
      );
  }

  /**
   * Sincronizar pedidos da Amazon
   */
  syncOrders(days: number = 7): Observable<any> {
    return this.http.post(`${this.apiUrl}/amazon/sync/orders`, { days });
  }

  /**
   * Testar conexão com Amazon SP-API
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/amazon/test-connection`);
  }

  /**
   * Atualizar saldo manualmente
   */
  updateBalance(balance: AmazonBalance): Observable<any> {
    return this.http.post(`${this.apiUrl}/amazon/saldos`, balance);
  }
}
