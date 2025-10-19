import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto, ProdutoWithMetrics, ProdutoKanbanColumn, ProdutoStatus } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  list(filters?: {
    status?: ProdutoStatus;
    categoria?: string;
    sku?: string;
    asin?: string;
    fornecedor?: string;
  }): Observable<Produto[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key]) {
          params = params.set(key, (filters as any)[key]);
        }
      });
    }

    return this.http.get<Produto[]>(this.apiUrl, { params });
  }

  findById(id: number, withMetrics = false): Observable<Produto | ProdutoWithMetrics> {
    const params = withMetrics ? new HttpParams().set('metrics', 'true') : undefined;
    return this.http.get<Produto | ProdutoWithMetrics>(`${this.apiUrl}/${id}`, { params });
  }

  create(produto: Partial<Produto>): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  update(id: number, produto: Partial<Produto>): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  updateStatus(id: number, status: ProdutoStatus): Observable<Produto> {
    return this.http.patch<Produto>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getKanbanData(): Observable<ProdutoKanbanColumn[]> {
    return this.http.get<ProdutoKanbanColumn[]>(`${this.apiUrl}/kanban`);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  findBySKU(sku: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/sku/${sku}`);
  }

  findByASIN(asin: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/asin/${asin}`);
  }
}
