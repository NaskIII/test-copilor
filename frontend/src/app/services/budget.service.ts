import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetCreate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly API = '/api/budgets';
  private http = inject(HttpClient);

  list(month: number, year: number): Observable<Budget[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Budget[]>(this.API + '/', { params });
  }

  createOrUpdate(budget: BudgetCreate): Observable<Budget> {
    return this.http.post<Budget>(this.API + '/', budget);
  }
}
