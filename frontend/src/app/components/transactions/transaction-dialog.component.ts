import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogModule, MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TransactionService } from '../../services/transaction.service';
import { Transaction, Category } from '../../models/models';

interface DialogData {
  transaction?: Transaction;
  categories: Category[];
}

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.transaction ? 'Editar' : 'Novo' }} Lançamento</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="type">
            <mat-option value="expense">💸 Despesa</mat-option>
            <mat-option value="income">💰 Receita</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description" placeholder="Ex: Almoço, Salário...">
          @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
            <mat-error>Descrição é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor (R$)</mat-label>
          <input matInput type="number" step="0.01" formControlName="amount" min="0.01">
          @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) {
            <mat-error>Valor é obrigatório</mat-error>
          }
          @if (form.get('amount')?.hasError('min')) {
            <mat-error>Valor deve ser positivo</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoria</mat-label>
          <mat-select formControlName="category_id">
            <mat-option [value]="null">Sem categoria</mat-option>
            @for (cat of filteredCategories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.icon }} {{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notas (opcional)</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || loading">
        @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
        @else { {{ data.transaction ? 'Salvar' : 'Criar' }} }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 8px; } mat-dialog-content { min-width: 320px; }`]
})
export class TransactionDialogComponent {
  private fb = inject(FormBuilder);
  private txService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<TransactionDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  loading = false;

  form = this.fb.group({
    type: [this.data.transaction?.type || 'expense', Validators.required],
    description: [this.data.transaction?.description || '', Validators.required],
    amount: [this.data.transaction?.amount || null, [Validators.required, Validators.min(0.01)]],
    date: [this.data.transaction ? new Date(this.data.transaction.date) : new Date(), Validators.required],
    category_id: [this.data.transaction?.category_id || null],
    notes: [this.data.transaction?.notes || ''],
  });

  get filteredCategories(): Category[] {
    const type = this.form.get('type')?.value;
    return this.data.categories.filter(c => c.type === type);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;
    const payload = {
      type: v.type as 'income' | 'expense',
      description: v.description!,
      amount: Number(v.amount),
      date: (v.date as Date).toISOString(),
      category_id: v.category_id ? Number(v.category_id) : undefined,
      notes: v.notes || undefined,
    };

    const op = this.data.transaction
      ? this.txService.update(this.data.transaction.id, payload)
      : this.txService.create(payload);

    op.subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(
          this.data.transaction ? 'Lançamento atualizado' : 'Lançamento criado',
          'OK', { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || 'Erro ao salvar', 'Fechar', { duration: 4000 });
      }
    });
  }
}
