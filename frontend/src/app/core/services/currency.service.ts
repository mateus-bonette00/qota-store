import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ExchangeRates {
  USD: number;
  BRL: number;
  EUR: number;
  updated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = environment.apiUrl;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);
  public rates$ = this.ratesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRates();
  }

  /**
   * Carregar taxas de câmbio
   */
  private loadRates() {
    this.http.get<ExchangeRates>(`${this.apiUrl}/currency/rates`)
      .subscribe(
        rates => this.ratesSubject.next(rates),
        error => console.error('Erro ao carregar taxas:', error)
      );
  }

  /**
   * Obter taxas atuais
   */
  getRates(): Observable<ExchangeRates> {
    return this.http.get<ExchangeRates>(`${this.apiUrl}/currency/rates`);
  }

  /**
   * Converter valor entre moedas
   */
  convert(amount: number, from: string, to: string): number {
    const rates = this.ratesSubject.value;
    if (!rates || from === to) return amount;

    // Converter para USD primeiro
    let amountInUSD = amount;
    if (from === 'BRL') {
      amountInUSD = amount / rates.BRL;
    } else if (from === 'EUR') {
      amountInUSD = amount / rates.EUR;
    }

    // Converter de USD para moeda destino
    if (to === 'BRL') {
      return amountInUSD * rates.BRL;
    } else if (to === 'EUR') {
      return amountInUSD * rates.EUR;
    }

    return amountInUSD;
  }

  /**
   * Formatar valor com símbolo de moeda
   */
  format(value: number, currency: string): string {
    const symbols: any = {
      'USD': '$',
      'BRL': 'R$',
      'EUR': '€'
    };

    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbols[currency] || ''} ${formatted}`;
  }
}
