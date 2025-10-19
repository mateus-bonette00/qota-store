import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Investimento {
  id?: number;
  data: string;
  tipo: string;
  valor: number;
  moeda: 'USD' | 'BRL' | 'EUR';
  valor_brl: number;
  valor_usd: number;
  valor_eur: number;
  metodo?: string;
  conta?: string;
  quem?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestimentosService {
  private apiUrl = `${environment.apiUrl}/investimentos`;

  constructor(private http: HttpClient) {}

  list(filters?: { mes?: string }): Observable<Investimento[]> {
    let params = new HttpParams();

    if (filters?.mes) {
      params = params.set('mes', filters.mes);
    }

    return this.http.get<Investimento[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Investimento> {
    return this.http.get<Investimento>(`${this.apiUrl}/${id}`);
  }

  create(investimento: Partial<Investimento>): Observable<Investimento> {
    return this.http.post<Investimento>(this.apiUrl, investimento);
  }

  update(id: number, investimento: Partial<Investimento>): Observable<Investimento> {
    return this.http.put<Investimento>(`${this.apiUrl}/${id}`, investimento);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}
