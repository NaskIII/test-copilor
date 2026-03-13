import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { Budget, Category } from '../../models/models';
import { forkJoin } from 'rxjs';

interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <h2>Orçamentos</h2>
      <div class="header-filters">
        <form [formGroup]="periodForm" class="period-row">
          <mat-form-field appearance="outline">
            <mat-label>Mês</mat-label>
            <mat-select formControlName="month">
              @for (m of months; track $index) {
                <mat-option [value]="$index + 1">{{ m }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Ano</mat-label>
            <mat-select formControlName="year">
              @for (y of years; track y) {
                <mat-option [value]="y">{{ y }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </form>
      </div>
    </div>

    <div class="budgets-layout">
      <!-- Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Definir Orçamento</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoria (opcional)</mat-label>
              <mat-select formControlName="category_id">
                <mat-option [value]="null">Orçamento Geral (Total de Despesas)</mat-option>
                @for (cat of expenseCategories; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Valor limite (R$)</mat-label>
              <input matInput type="number" step="0.01" formControlName="amount" min="0.01">
              @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) {
                <mat-error>Valor é obrigatório</mat-error>
              }
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" class="full-width"
              [disabled]="form.invalid || loading">
              @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
              @else { Salvar Orçamento }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Budget List -->
      <div>
        @if (loadingBudgets) {
          <div class="loading-center"><mat-spinner></mat-spinner></div>
        } @else if (budgets.length === 0) {
          <mat-card>
            <mat-card-content>
              <div class="empty-state">
                <mat-icon>account_balance_wallet</mat-icon>
                <p>Nenhum orçamento definido para este período.</p>
              </div>
            </mat-card-content>
          </mat-card>
        } @else {
          @for (budget of budgets; track budget.id) {
            <mat-card class="budget-card" [class.over-budget]="budget.percentage > 100">
              <mat-card-content>
                <div class="budget-header">
                  <div class="budget-title">
                    @if (budget.category) {
                      <span class="cat-icon" [style.background]="budget.category.color">
                        {{ budget.category.icon }}
                      </span>
                      <span>{{ budget.category.name }}</span>
                    } @else {
                      <mat-icon class="general-icon">account_balance_wallet</mat-icon>
                      <span>Orçamento Geral</span>
                    }
                  </div>
                  <div class="budget-values">
                    <span class="spent" [class.over]="budget.percentage > 100">
                      {{ budget.spent | currency:'BRL':'symbol':'1.2-2' }}
                    </span>
                    <span class="separator">/</span>
                    <span class="limit">{{ budget.amount | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
                <mat-progress-bar
                  [value]="budget.percentage > 100 ? 100 : budget.percentage"
                  [color]="budget.percentage > 100 ? 'warn' : budget.percentage > 80 ? 'accent' : 'primary'"
                  class="budget-bar">
                </mat-progress-bar>
                <div class="budget-footer">
                  <span>{{ budget.percentage | number:'1.0-0' }}% utilizado</span>
                  @if (budget.percentage > 100) {
                    <span class="over-msg">⚠️ Orçamento ultrapassado!</span>
                  } @else {
                    <span class="remaining">
                      Restam {{ (budget.amount - budget.spent) | currency:'BRL':'symbol':'1.2-2' }}
                    </span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 700; }
    .period-row { display: flex; gap: 12px; }
    .period-row mat-form-field { min-width: 120px; }
    .budgets-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
    @media (max-width: 768px) { .budgets-layout { grid-template-columns: 1fr; } }
    .full-width { width: 100%; margin-bottom: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .budget-card { margin-bottom: 16px; }
    .budget-card.over-budget { border-left: 4px solid #f44336; }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .budget-title { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .cat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .general-icon { color: #3f51b5; }
    .budget-values { display: flex; align-items: center; gap: 4px; }
    .spent { font-weight: 700; }
    .spent.over { color: #f44336; }
    .separator { color: #999; }
    .limit { color: #666; }
    .budget-bar { margin: 8px 0; }
    .budget-footer { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-top: 4px; }
    .over-msg { color: #f44336; font-weight: 500; }
    .remaining { color: #4caf50; }
  `]
})
export class BudgetsComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private txService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  budgets: BudgetWithSpent[] = [];
  categories: Category[] = [];
  loading = false;
  loadingBudgets = true;
  now = new Date();
  months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  years = Array.from({ length: 5 }, (_, i) => this.now.getFullYear() - i);

  periodForm = this.fb.group({
    month: [this.now.getMonth() + 1],
    year: [this.now.getFullYear()],
  });

  form = this.fb.group({
    category_id: [null as number | null],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  get expenseCategories(): Category[] {
    return this.categories.filter(c => c.type === 'expense');
  }

  ngOnInit(): void {
    this.categoryService.list().subscribe(cats => { this.categories = cats; });
    this.loadBudgets();
    this.periodForm.valueChanges.subscribe(() => this.loadBudgets());
  }

  loadBudgets(): void {
    this.loadingBudgets = true;
    const { month, year } = this.periodForm.value;
    forkJoin({
      budgets: this.budgetService.list(month!, year!),
      transactions: this.txService.list({ page_size: 1000, type: 'expense',
        start_date: new Date(year!, month! - 1, 1).toISOString(),
        end_date: new Date(year!, month!, 0, 23, 59, 59).toISOString(),
      }),
    }).subscribe({
      next: ({ budgets, transactions }) => {
        const txItems = transactions.items;
        this.budgets = budgets.map(budget => {
          const spent = budget.category_id
            ? txItems.filter(t => t.category_id === budget.category_id).reduce((s, t) => s + t.amount, 0)
            : txItems.reduce((s, t) => s + t.amount, 0);
          return { ...budget, spent, percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0 };
        });
        this.loadingBudgets = false;
      },
      error: () => { this.loadingBudgets = false; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { month, year } = this.periodForm.value;
    const v = this.form.value;
    this.budgetService.createOrUpdate({
      amount: Number(v.amount),
      month: month!,
      year: year!,
      category_id: v.category_id ? Number(v.category_id) : undefined,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Orçamento salvo', 'OK', { duration: 3000 });
        this.form.reset({ category_id: null, amount: null });
        this.loadBudgets();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || 'Erro', 'Fechar', { duration: 4000 });
      }
    });
  }
}
