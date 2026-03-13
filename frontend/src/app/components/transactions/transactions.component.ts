import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, Category, TransactionType } from '../../models/models';
import { TransactionDialogComponent } from './transaction-dialog.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <h2>Lançamentos</h2>
      <button mat-raised-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon> Novo Lançamento
      </button>
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <mat-card-content>
        <form [formGroup]="filterForm" class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type">
              <mat-option value="">Todos</mat-option>
              <mat-option value="income">Receitas</mat-option>
              <mat-option value="expense">Despesas</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoria</mat-label>
            <mat-select formControlName="category_id">
              <mat-option value="">Todas</mat-option>
              @for (cat of categories; track cat.id) {
                <mat-option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Data inicial</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Data final</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="end_date">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Limpar
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- Table -->
    <mat-card>
      <mat-card-content>
        @if (loading) {
          <div class="loading-center"><mat-spinner></mat-spinner></div>
        } @else if (transactions.length === 0) {
          <div class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p>Nenhum lançamento encontrado.</p>
            <button mat-raised-button color="primary" (click)="openDialog()">
              Adicionar primeiro lançamento
            </button>
          </div>
        } @else {
          <table mat-table [dataSource]="transactions" class="full-width">
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let tx">
                <mat-icon [class]="tx.type === 'income' ? 'income-icon' : 'expense-icon'">
                  {{ tx.type === 'income' ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let tx">
                <div class="desc-cell">
                  @if (tx.category) {
                    <span class="cat-badge" [style.background]="tx.category.color">
                      {{ tx.category.icon }}
                    </span>
                  }
                  <span>{{ tx.description }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Categoria</th>
              <td mat-cell *matCellDef="let tx">{{ tx.category?.name || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let tx">{{ tx.date | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let tx" class="amount-cell"
                  [class.income]="tx.type === 'income'"
                  [class.expense]="tx.type === 'expense'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let tx">
                <button mat-icon-button (click)="openDialog(tx)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteTransaction(tx)" matTooltip="Excluir">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)">
          </mat-paginator>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
    }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 700; }
    .filters-card { margin-bottom: 16px; }
    .filters-row {
      display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
    }
    .filters-row mat-form-field { min-width: 160px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .empty-state {
      text-align: center; padding: 60px; color: #999;
    }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; }
    .full-width { width: 100%; }
    .income-icon { color: #4caf50; }
    .expense-icon { color: #f44336; }
    .desc-cell { display: flex; align-items: center; gap: 8px; }
    .cat-badge {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .amount-cell { font-weight: 700; }
    .amount-cell.income { color: #4caf50; }
    .amount-cell.expense { color: #f44336; }
  `]
})
export class TransactionsComponent implements OnInit {
  private txService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = true;
  totalItems = 0;
  page = 1;
  pageSize = 20;
  displayedColumns = ['type', 'description', 'category', 'date', 'amount', 'actions'];

  filterForm = this.fb.group({
    type: [''],
    category_id: [''],
    start_date: [null as Date | null],
    end_date: [null as Date | null],
  });

  ngOnInit(): void {
    this.categoryService.list().subscribe(cats => { this.categories = cats; });
    this.loadTransactions();
    this.filterForm.valueChanges.subscribe(() => {
      this.page = 1;
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.txService.list({
      page: this.page,
      page_size: this.pageSize,
      type: (v.type as TransactionType) || undefined,
      category_id: v.category_id ? Number(v.category_id) : undefined,
      start_date: v.start_date ? (v.start_date as Date).toISOString() : undefined,
      end_date: v.end_date ? (v.end_date as Date).toISOString() : undefined,
    }).subscribe({
      next: (resp) => {
        this.transactions = resp.items;
        this.totalItems = resp.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset({ type: '', category_id: '', start_date: null, end_date: null });
  }

  openDialog(transaction?: Transaction): void {
    const ref = this.dialog.open(TransactionDialogComponent, {
      width: '500px',
      data: { transaction, categories: this.categories }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadTransactions();
    });
  }

  deleteTransaction(tx: Transaction): void {
    if (!confirm(`Excluir "${tx.description}"?`)) return;
    this.txService.delete(tx.id).subscribe({
      next: () => {
        this.snackBar.open('Lançamento excluído', 'OK', { duration: 3000 });
        this.loadTransactions();
      }
    });
  }
}
