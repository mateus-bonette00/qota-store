import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyInfo } from '../models/company-info.model';

@Injectable({ providedIn: 'root' })
export class CompanyInfoService {
  private apiUrl = `${environment.apiUrl}/company-info`;

  constructor(private http: HttpClient) {}

  get(): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(this.apiUrl);
  }

  createOrUpdate(info: Partial<CompanyInfo>): Observable<CompanyInfo> {
    return this.http.post<CompanyInfo>(this.apiUrl, info);
  }

  update(info: Partial<CompanyInfo>): Observable<CompanyInfo> {
    return this.http.put<CompanyInfo>(this.apiUrl, info);
  }
}
