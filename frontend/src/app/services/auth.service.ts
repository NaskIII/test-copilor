import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, TokenResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.API}/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    return this.http.post<TokenResponse>(`${this.API}/token`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, updates).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }
}
