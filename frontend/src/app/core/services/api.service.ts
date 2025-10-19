import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========== GASTOS ==========
  getGastos(month?: string): Observable<any[]> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/gastos`, { params });
  }

  createGasto(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gastos`, data);
  }

  updateGasto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/gastos/${id}`, data);
  }

  deleteGasto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/gastos/${id}`);
  }

  // ========== INVESTIMENTOS ==========
  getInvestimentos(month?: string): Observable<any[]> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/investimentos`, { params });
  }

  createInvestimento(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/investimentos`, data);
  }

  deleteInvestimento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/investimentos/${id}`);
  }

  // ========== PRODUTOS ==========
  getProdutos(month?: string): Observable<any[]> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/produtos`, { params });
  }

  createProduto(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/produtos`, data);
  }

  updateProduto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/produtos/${id}`, data);
  }

  deleteProduto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produtos/${id}`);
  }

  // ========== AMAZON RECEITAS ==========
  getAmazonReceitas(month?: string): Observable<any[]> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/amazon/receitas`, { params });
  }

  createAmazonReceita(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/amazon/receitas`, data);
  }

  deleteAmazonReceita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/amazon/receitas/${id}`);
  }

  getAmazonSaldoLatest(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/amazon/saldos/latest`);
  }

  // ========== MÉTRICAS ==========
  getResumoMensal(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any>(`${this.apiUrl}/metrics/resumo`, { params });
  }

  getTotaisAcumulados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics/totais`);
  }

  getLucros(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any>(`${this.apiUrl}/metrics/lucros`, { params });
  }

  getSerieMensal(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/metrics/series`);
  }

  getProductSales(scope: string, order: string, limit: number, year?: string, month?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('scope', scope)
      .set('order', order)
      .set('limit', limit.toString());

    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);

    return this.http.get<any[]>(`${this.apiUrl}/metrics/products/sales`, { params });
  }

  getDashboard(month?: string): Observable<any> {
    const params = month ? new HttpParams().set('month', month) : new HttpParams();
    return this.http.get<any>(`${this.apiUrl}/metrics/dashboard`, { params });
  }

  // ========== RECEITAS (FBA) ==========
  getReceitas(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/receitas`, { params });
  }

  getReceitaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/receitas/${id}`);
  }

  createReceita(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/receitas`, data);
  }

  updateReceita(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/receitas/${id}`, data);
  }

  deleteReceita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/receitas/${id}`);
  }

  getReceitasSummary(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/receitas/summary`, { params });
  }

  getReceitasPorProduto(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/receitas/por-produto`, { params });
  }

  // ========== FORNECEDORES ==========
  getFornecedores(search?: string): Observable<any[]> {
    const params = search ? new HttpParams().set('search', search) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/fornecedores`, { params });
  }

  getFornecedorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fornecedores/${id}`);
  }

  createFornecedor(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fornecedores`, data);
  }

  updateFornecedor(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/fornecedores/${id}`, data);
  }

  deleteFornecedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fornecedores/${id}`);
  }

  // ========== COMPANY INFO ==========
  getCompanyInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/company-info`);
  }

  updateCompanyInfo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/company-info`, data);
  }

  // ========== SISTEMAS EXTERNOS ==========
  getSistemasExternos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sistemas-externos`);
  }

  getSistemaExternoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sistemas-externos/${id}`);
  }

  createSistemaExterno(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sistemas-externos`, data);
  }

  updateSistemaExterno(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/sistemas-externos/${id}`, data);
  }

  deleteSistemaExterno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sistemas-externos/${id}`);
  }
}
