import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = '/api/categories';
  private http = inject(HttpClient);

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API + '/');
  }

  create(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(this.API + '/', category);
  }

  update(id: number, category: Partial<CategoryCreate>): Observable<Category> {
    return this.http.put<Category>(`${this.API}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
