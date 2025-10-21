import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeriodService {
  private readonly KEY = 'qota.period';
  private _monthYear = new BehaviorSubject<string>(this.initial());

  monthYear$ = this._monthYear.asObservable();

  private initial(): string {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.KEY) : null;
    if (saved) return saved;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  setMonthYear(v: string) {
    if (!v) return;
    try { localStorage.setItem(this.KEY, v); } catch {}
    this._monthYear.next(v);
  }

  get value(): string {
    return this._monthYear.value;
  }
}
