import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="logo-header">
            <span class="logo-icon">💰</span>
            <h1>FinançasPro</h1>
            <p>Gerencie suas finanças com inteligência</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>E-mail é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Senha é obrigatória</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
              [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Entrar
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="text-center">
            Não tem conta? <a routerLink="/auth/register">Cadastre-se</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    }
    .auth-card {
      width: 400px;
      max-width: 95vw;
      padding: 16px;
      border-radius: 16px !important;
    }
    .logo-header {
      text-align: center;
      width: 100%;
      padding: 16px 0;
    }
    .logo-icon { font-size: 48px; }
    h1 { margin: 8px 0 4px; font-size: 28px; font-weight: 700; color: #1a237e; }
    p { color: #666; margin: 0; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    mat-card-actions { justify-content: center; }
    .text-center { text-align: center; }
    a { color: #3f51b5; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  hidePassword = true;

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.detail || 'E-mail ou senha incorretos',
          'Fechar', { duration: 4000 }
        );
      },
    });
  }
}
