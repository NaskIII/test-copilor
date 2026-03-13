import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportResponse, MonthlySummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getMonthlyReport(month: number, year: number): Observable<ReportResponse> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<ReportResponse>('/api/reports/monthly', { params });
  }

  getAnnualReport(year: number): Observable<MonthlySummary[]> {
    const params = new HttpParams().set('year', year);
    return this.http.get<MonthlySummary[]>('/api/reports/annual', { params });
  }
}
