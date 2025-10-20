import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SenhaFornecedor } from '../models/senha-fornecedor.model';

@Injectable({ providedIn: 'root' })
export class SenhasFornecedoresService {
  private apiUrl = `${environment.apiUrl}/senhas-fornecedores`;

  constructor(private http: HttpClient) {}

  list(): Observable<SenhaFornecedor[]> {
    return this.http.get<SenhaFornecedor[]>(this.apiUrl);
  }

  getById(id: number): Observable<SenhaFornecedor> {
    return this.http.get<SenhaFornecedor>(`${this.apiUrl}/${id}`);
  }

  create(senha: Partial<SenhaFornecedor>): Observable<SenhaFornecedor> {
    return this.http.post<SenhaFornecedor>(this.apiUrl, senha);
  }

  update(id: number, senha: Partial<SenhaFornecedor>): Observable<SenhaFornecedor> {
    return this.http.put<SenhaFornecedor>(`${this.apiUrl}/${id}`, senha);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
