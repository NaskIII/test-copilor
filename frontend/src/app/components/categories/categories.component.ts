import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { CategoryService } from '../../services/category.service';
import { Category, TransactionType } from '../../models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule,
    MatTooltipModule, MatTabsModule,
  ],
  template: `
    <div class="page-header">
      <h2>Categorias</h2>
    </div>

    <div class="categories-layout">
      <!-- Add Category Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingCategory ? 'Editar' : 'Nova' }} Categoria</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="expense">💸 Despesa</mat-option>
                <mat-option value="income">💰 Receita</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Alimentação">
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Nome é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ícone (emoji)</mat-label>
              <input matInput formControlName="icon" placeholder="🍔">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cor</mat-label>
              <input matInput type="color" formControlName="color">
            </mat-form-field>

            <div class="form-actions">
              @if (editingCategory) {
                <button mat-stroked-button type="button" (click)="cancelEdit()">Cancelar</button>
              }
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
                @else { {{ editingCategory ? 'Salvar' : 'Criar' }} }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Category Lists -->
      <div class="lists-container">
        <mat-tab-group>
          <mat-tab label="💸 Despesas">
            <div class="categories-grid">
              @for (cat of expenseCategories; track cat.id) {
                <div class="category-chip" [style.border-color]="cat.color">
                  <span class="cat-icon-bg" [style.background]="cat.color">{{ cat.icon }}</span>
                  <span class="cat-name">{{ cat.name }}</span>
                  <div class="cat-actions">
                    <button mat-icon-button (click)="editCategory(cat)" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteCategory(cat)" matTooltip="Excluir">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
              @empty {
                <p class="empty-msg">Nenhuma categoria de despesa.</p>
              }
            </div>
          </mat-tab>
          <mat-tab label="💰 Receitas">
            <div class="categories-grid">
              @for (cat of incomeCategories; track cat.id) {
                <div class="category-chip" [style.border-color]="cat.color">
                  <span class="cat-icon-bg" [style.background]="cat.color">{{ cat.icon }}</span>
                  <span class="cat-name">{{ cat.name }}</span>
                  <div class="cat-actions">
                    <button mat-icon-button (click)="editCategory(cat)" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteCategory(cat)" matTooltip="Excluir">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
              @empty {
                <p class="empty-msg">Nenhuma categoria de receita.</p>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
    }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 700; }
    .categories-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .categories-layout { grid-template-columns: 1fr; }
    }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .categories-grid {
      display: flex; flex-wrap: wrap; gap: 12px;
      padding: 16px;
    }
    .category-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 12px;
      border: 2px solid; background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .cat-icon-bg {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .cat-name { font-weight: 500; }
    .cat-actions { display: flex; }
    .empty-msg { color: #999; padding: 16px; }
  `]
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  loading = false;
  editingCategory: Category | null = null;

  form = this.fb.group({
    type: ['expense' as TransactionType, Validators.required],
    name: ['', Validators.required],
    icon: ['💰'],
    color: ['#3f51b5'],
  });

  get expenseCategories(): Category[] {
    return this.categories.filter(c => c.type === 'expense');
  }

  get incomeCategories(): Category[] {
    return this.categories.filter(c => c.type === 'income');
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.list().subscribe(cats => { this.categories = cats; });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;
    const payload = {
      type: v.type as TransactionType,
      name: v.name!,
      icon: v.icon || '💰',
      color: v.color || '#3f51b5',
    };
    const op = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, payload)
      : this.categoryService.create(payload);

    op.subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(
          this.editingCategory ? 'Categoria atualizada' : 'Categoria criada',
          'OK', { duration: 3000 }
        );
        this.editingCategory = null;
        this.form.reset({ type: 'expense', icon: '💰', color: '#3f51b5' });
        this.loadCategories();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || 'Erro', 'Fechar', { duration: 4000 });
      }
    });
  }

  editCategory(cat: Category): void {
    this.editingCategory = cat;
    this.form.patchValue({ type: cat.type, name: cat.name, icon: cat.icon, color: cat.color });
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.form.reset({ type: 'expense', icon: '💰', color: '#3f51b5' });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Excluir categoria "${cat.name}"?`)) return;
    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        this.snackBar.open('Categoria excluída', 'OK', { duration: 3000 });
        this.loadCategories();
      }
    });
  }
}
