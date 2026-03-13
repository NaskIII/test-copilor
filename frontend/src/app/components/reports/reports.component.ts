import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
} from 'chart.js';

import { ReportService } from '../../services/report.service';
import { ReportResponse, MonthlySummary, CategorySummary } from '../../models/models';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Title);

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatTabsModule, BaseChartDirective,
  ],
  template: `
    <div class="page-header">
      <h2>Relatórios</h2>
      <div class="header-filters">
        <form [formGroup]="filterForm" class="filter-row">
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

    @if (loading) {
      <div class="loading-center"><mat-spinner></mat-spinner></div>
    } @else if (report) {
      <!-- Summary Chips -->
      <div class="summary-row">
        <mat-card class="stat-card income">
          <mat-card-content>
            <mat-icon>trending_up</mat-icon>
            <div>
              <div class="stat-label">Receitas</div>
              <div class="stat-value">{{ report.monthly_summary.total_income | currency:'BRL':'symbol':'1.2-2' }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card expense">
          <mat-card-content>
            <mat-icon>trending_down</mat-icon>
            <div>
              <div class="stat-label">Despesas</div>
              <div class="stat-value">{{ report.monthly_summary.total_expenses | currency:'BRL':'symbol':'1.2-2' }}</div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card" [class.balance-pos]="report.monthly_summary.balance >= 0" [class.balance-neg]="report.monthly_summary.balance < 0">
          <mat-card-content>
            <mat-icon>account_balance</mat-icon>
            <div>
              <div class="stat-label">Saldo</div>
              <div class="stat-value">{{ report.monthly_summary.balance | currency:'BRL':'symbol':'1.2-2' }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <!-- Tab: Categories -->
        <mat-tab label="Por Categoria">
          <div class="tab-content">
            @if (report.by_category.length === 0) {
              <div class="empty-state">Sem despesas neste período.</div>
            } @else {
              <div class="charts-2col">
                <mat-card>
                  <mat-card-header><mat-card-title>Distribuição de Despesas</mat-card-title></mat-card-header>
                  <mat-card-content class="chart-wrap">
                    <canvas baseChart [data]="doughnutData" [options]="doughnutOptions" type="doughnut"></canvas>
                  </mat-card-content>
                </mat-card>
                <mat-card>
                  <mat-card-header><mat-card-title>Ranking de Categorias</mat-card-title></mat-card-header>
                  <mat-card-content>
                    @for (cat of report.by_category; track cat.category_id) {
                      <div class="cat-rank-row">
                        <span class="cat-icon" [style.background]="cat.category_color">{{ cat.category_icon }}</span>
                        <div class="cat-rank-info">
                          <div class="cat-rank-header">
                            <span>{{ cat.category_name }}</span>
                            <span class="cat-rank-val">{{ cat.total | currency:'BRL':'symbol':'1.2-2' }}</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" [style.width.%]="cat.percentage" [style.background]="cat.category_color"></div>
                          </div>
                          <span class="cat-pct">{{ cat.percentage }}%</span>
                        </div>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Tab: Daily Trend -->
        <mat-tab label="Evolução Diária">
          <div class="tab-content">
            @if (report.daily_trend.length === 0) {
              <div class="empty-state">Sem lançamentos neste período.</div>
            } @else {
              <mat-card>
                <mat-card-header><mat-card-title>Fluxo de Caixa Diário</mat-card-title></mat-card-header>
                <mat-card-content class="chart-wrap-tall">
                  <canvas baseChart [data]="barData" [options]="barOptions" type="bar"></canvas>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Tab: Annual -->
        <mat-tab label="Visão Anual">
          <div class="tab-content">
            @if (annualData) {
              <mat-card>
                <mat-card-header><mat-card-title>Resumo Anual {{ filterForm.get('year')?.value }}</mat-card-title></mat-card-header>
                <mat-card-content class="chart-wrap-tall">
                  <canvas baseChart [data]="annualChartData" [options]="annualOptions" type="bar"></canvas>
                </mat-card-content>
              </mat-card>
            } @else {
              <div class="loading-center"><mat-spinner></mat-spinner></div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 700; }
    .filter-row { display: flex; gap: 12px; }
    .filter-row mat-form-field { min-width: 120px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .summary-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .stat-card { flex: 1; min-width: 160px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 12px; padding: 16px !important; }
    .stat-card mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-card.income mat-icon { color: #4caf50; }
    .stat-card.expense mat-icon { color: #f44336; }
    .stat-card.balance-pos mat-icon { color: #2196f3; }
    .stat-card.balance-neg mat-icon { color: #ff9800; }
    .stat-label { font-size: 12px; color: #666; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .tab-content { padding: 16px 0; }
    .charts-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .charts-2col { grid-template-columns: 1fr; } }
    .chart-wrap { height: 280px; position: relative; }
    .chart-wrap canvas { max-height: 260px; }
    .chart-wrap-tall { height: 320px; position: relative; }
    .cat-rank-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .cat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .cat-rank-info { flex: 1; }
    .cat-rank-header { display: flex; justify-content: space-between; }
    .cat-rank-val { font-weight: 700; }
    .progress-bar { height: 6px; background: #eee; border-radius: 3px; margin: 4px 0; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .cat-pct { font-size: 12px; color: #888; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
  `]
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  loading = true;
  report: ReportResponse | null = null;
  annualData: MonthlySummary[] | null = null;

  months = MONTHS;
  now = new Date();
  years = Array.from({ length: 5 }, (_, i) => this.now.getFullYear() - i);

  filterForm = this.fb.group({
    month: [this.now.getMonth() + 1],
    year: [this.now.getFullYear()],
  });

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { ticks: { callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}` } } }
  };

  annualChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  annualOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { ticks: { callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}` } } }
  };

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => this.loadReport());
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    const { month, year } = this.filterForm.value;
    this.reportService.getMonthlyReport(month!, year!).subscribe({
      next: (report) => {
        this.report = report;
        this.buildCharts(report);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.reportService.getAnnualReport(year!).subscribe({
      next: (data) => {
        this.annualData = data;
        this.buildAnnualChart(data);
      }
    });
  }

  private buildCharts(report: ReportResponse): void {
    this.doughnutData = {
      labels: report.by_category.map(c => `${c.category_icon} ${c.category_name}`),
      datasets: [{
        data: report.by_category.map(c => c.total),
        backgroundColor: report.by_category.map(c => c.category_color),
      }]
    };
    this.barData = {
      labels: report.daily_trend.map(d => {
        const [, m, day] = d.date.split('-');
        return `${day}/${m}`;
      }),
      datasets: [
        { label: 'Receitas', data: report.daily_trend.map(d => d.income), backgroundColor: 'rgba(76,175,80,0.7)' },
        { label: 'Despesas', data: report.daily_trend.map(d => d.expenses), backgroundColor: 'rgba(244,67,54,0.7)' },
      ]
    };
  }

  private buildAnnualChart(data: MonthlySummary[]): void {
    this.annualChartData = {
      labels: MONTHS,
      datasets: [
        { label: 'Receitas', data: data.map(d => d.total_income), backgroundColor: 'rgba(76,175,80,0.7)' },
        { label: 'Despesas', data: data.map(d => d.total_expenses), backgroundColor: 'rgba(244,67,54,0.7)' },
        { label: 'Saldo', data: data.map(d => d.balance), backgroundColor: 'rgba(33,150,243,0.7)', type: 'line' as any, borderColor: '#2196f3' },
      ]
    };
  }
}
