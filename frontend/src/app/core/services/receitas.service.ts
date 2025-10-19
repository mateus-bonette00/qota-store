import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receita, ReceitaSummary } from '../models/receita.model';

@Injectable({
  providedIn: 'root'
})
export class ReceitasService {
  private apiUrl = `${environment.apiUrl}/receitas`;

  constructor(private http: HttpClient) {}

  list(filters?: {
    mes?: string;
    origem?: string;
    produto_id?: number;
    sku?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Observable<Receita[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key]) {
          params = params.set(key, (filters as any)[key].toString());
        }
      });
    }

    return this.http.get<Receita[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Receita> {
    return this.http.get<Receita>(`${this.apiUrl}/${id}`);
  }

  create(receita: Partial<Receita>): Observable<Receita> {
    return this.http.post<Receita>(this.apiUrl, receita);
  }

  update(id: number, receita: Partial<Receita>): Observable<Receita> {
    return this.http.put<Receita>(`${this.apiUrl}/${id}`, receita);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSummary(filters?: { mes?: string; origem?: string }): Observable<ReceitaSummary> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key]) {
          params = params.set(key, (filters as any)[key]);
        }
      });
    }

    return this.http.get<ReceitaSummary>(`${this.apiUrl}/summary`, { params });
  }

  getReceitasPorProduto(filters?: { mes?: string }): Observable<any[]> {
    let params = new HttpParams();

    if (filters?.mes) {
      params = params.set('mes', filters.mes);
    }

    return this.http.get<any[]>(`${this.apiUrl}/por-produto`, { params });
  }
}
