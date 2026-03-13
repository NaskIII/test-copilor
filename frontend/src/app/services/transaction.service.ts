import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Transaction, TransactionCreate, TransactionUpdate, TransactionListResponse, TransactionType
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API = '/api/transactions';
  private http = inject(HttpClient);

  list(params: {
    page?: number;
    page_size?: number;
    type?: TransactionType;
    category_id?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Observable<TransactionListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);
    if (params.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params.end_date) httpParams = httpParams.set('end_date', params.end_date);
    return this.http.get<TransactionListResponse>(this.API + '/', { params: httpParams });
  }

  get(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API}/${id}`);
  }

  create(transaction: TransactionCreate): Observable<Transaction> {
    return this.http.post<Transaction>(this.API + '/', transaction);
  }

  update(id: number, transaction: TransactionUpdate): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.API}/${id}`, transaction);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
