import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Senha } from '../models/senha.model';

@Injectable({ providedIn: 'root' })
export class SenhasService {
  private apiUrl = `${environment.apiUrl}/senhas`;

  constructor(private http: HttpClient) {}

  list(): Observable<Senha[]> {
    return this.http.get<Senha[]>(this.apiUrl);
  }

  getById(id: number): Observable<Senha> {
    return this.http.get<Senha>(`${this.apiUrl}/${id}`);
  }

  create(senha: Partial<Senha>): Observable<Senha> {
    return this.http.post<Senha>(this.apiUrl, senha);
  }

  update(id: number, senha: Partial<Senha>): Observable<Senha> {
    return this.http.put<Senha>(`${this.apiUrl}/${id}`, senha);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
