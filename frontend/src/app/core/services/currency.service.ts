import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Currency = 'USD' | 'BRL' | 'EUR';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrency$ = new BehaviorSubject<Currency>('USD');
  private rates: { USD: number; BRL: number; EUR: number } = {
    USD: 1,
    BRL: 5.20,
    EUR: 0.92
  };

  constructor() {
    // Load saved currency preference
    const saved = localStorage.getItem('preferredCurrency') as Currency;
    if (saved) {
      this.currentCurrency$.next(saved);
    }
  }

  getCurrentCurrency(): Observable<Currency> {
    return this.currentCurrency$.asObservable();
  }

  getCurrentCurrencyValue(): Currency {
    return this.currentCurrency$.value;
  }

  setCurrency(currency: Currency): void {
    this.currentCurrency$.next(currency);
    localStorage.setItem('preferredCurrency', currency);
  }

  setRates(rates: { USD: number; BRL: number; EUR: number }): void {
    this.rates = rates;
  }

  convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;

    // Convert to USD first
    const amountInUSD = amount / this.rates[from];

    // Convert to target currency
    return amountInUSD * this.rates[to];
  }

  format(amount: number, currency: Currency): string {
    const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
      USD: '$',
      BRL: 'R$',
      EUR: '€'
    };
    return symbols[currency];
  }

  getCurrencyColor(currency: Currency): string {
    const colors: Record<Currency, string> = {
      USD: '#3B82F6', // Blue
      BRL: '#10B981', // Green
      EUR: '#F59E0B'  // Orange
    };
    return colors[currency];
  }
}
