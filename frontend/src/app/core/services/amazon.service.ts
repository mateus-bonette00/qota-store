import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AmazonBalance {
  disponivel: number;
  pendente: number;
  moeda: 'USD' | 'BRL' | 'EUR' | string;
}

@Injectable({ providedIn: 'root' })
export class AmazonService {
  private apiUrl = environment.apiUrl;

  private balanceSubject = new BehaviorSubject<AmazonBalance | null>(null);
  /** stream público para quem quiser observar o saldo */
  public balances = this.balanceSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Buscar saldo Amazon (cacheado no BehaviorSubject ou forçar refresh)
   */
  getBalance(forceRefresh: boolean = false): Observable<AmazonBalance> {
    let params = new HttpParams();
    if (forceRefresh) {
      params = params.set('force_refresh', 'true');
    }

    return this.http
      .get<AmazonBalance>(`${this.apiUrl}/amazon/saldos/latest`, { params })
      .pipe(tap((balance) => this.balanceSubject.next(balance)));
  }

  /**
   * Sincronizar pedidos da Amazon (últimos X dias)
   */
  syncOrders(days: number = 7): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/amazon/sync/orders`, { days });
  }

  /**
   * Testar conexão com Amazon SP-API
   */
  testConnection(): Observable<{ success: boolean; message: string; balance?: AmazonBalance }> {
    return this.http.get<{ success: boolean; message: string; balance?: AmazonBalance }>(
      `${this.apiUrl}/amazon/test-connection`
    );
  }
}
