import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
} from 'chart.js';

import { ReportService } from '../../services/report.service';
import { TransactionService } from '../../services/transaction.service';
import { ReportResponse, Transaction } from '../../models/models';

Chart.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterLink,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  template: `
    <div class="page-header">
      <h2>Dashboard</h2>
      <p>{{ currentMonthLabel }}</p>
    </div>

    @if (loading) {
      <div class="loading-center">
        <mat-spinner></mat-spinner>
      </div>
    } @else if (report) {
      <!-- Summary Cards -->
      <div class="cards-grid">
        <mat-card class="summary-card income-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>trending_up</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Receitas</span>
              <span class="card-value">{{ report.monthly_summary.total_income | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expense-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>trending_down</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Despesas</span>
              <span class="card-value">{{ report.monthly_summary.total_expenses | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" [class.balance-positive]="report.monthly_summary.balance >= 0" [class.balance-negative]="report.monthly_summary.balance < 0">
          <mat-card-content>
            <div class="card-icon"><mat-icon>account_balance</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Saldo</span>
              <span class="card-value">{{ report.monthly_summary.balance | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card count-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>receipt_long</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Lançamentos</span>
              <span class="card-value">{{ report.monthly_summary.transaction_count }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        @if (report.by_category.length > 0) {
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Despesas por Categoria</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-content">
              <canvas baseChart
                [data]="doughnutData"
                [options]="doughnutOptions"
                type="doughnut">
              </canvas>
            </mat-card-content>
          </mat-card>
        }

        @if (report.daily_trend.length > 0) {
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Fluxo Diário</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-content">
              <canvas baseChart
                [data]="lineData"
                [options]="lineOptions"
                type="line">
              </canvas>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Recent Transactions -->
      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Últimos Lançamentos</mat-card-title>
          <div class="card-actions-right">
            <button mat-button color="primary" routerLink="/transactions">Ver todos</button>
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (recentTransactions.length === 0) {
            <div class="empty-state">
              <mat-icon>receipt_long</mat-icon>
              <p>Nenhum lançamento ainda.</p>
              <button mat-raised-button color="primary" routerLink="/transactions">
                Adicionar lançamento
              </button>
            </div>
          } @else {
            @for (tx of recentTransactions; track tx.id) {
              <div class="transaction-row">
                <div class="tx-icon" [style.background]="tx.category?.color || '#999'">
                  {{ tx.category?.icon || '💰' }}
                </div>
                <div class="tx-info">
                  <span class="tx-desc">{{ tx.description }}</span>
                  <span class="tx-date">{{ tx.date | date:'dd/MM/yyyy' }}</span>
                </div>
                <span class="tx-amount" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 28px; font-weight: 700; }
    .page-header p { margin: 4px 0 0; color: #666; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }
    .card-icon {
      width: 52px; height: 52px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .income-card .card-icon { background: #4caf50; }
    .expense-card .card-icon { background: #f44336; }
    .balance-positive .card-icon { background: #2196f3; }
    .balance-negative .card-icon { background: #ff9800; }
    .count-card .card-icon { background: #9c27b0; }
    .card-info { display: flex; flex-direction: column; }
    .card-label { font-size: 13px; color: #666; }
    .card-value { font-size: 22px; font-weight: 700; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .chart-card mat-card-content { padding: 16px !important; }
    .chart-content { height: 260px; position: relative; }
    .chart-content canvas { max-height: 240px; }

    .recent-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-actions-right { margin-left: auto; }
    .transaction-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .transaction-row:last-child { border-bottom: none; }
    .tx-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .tx-info { flex: 1; display: flex; flex-direction: column; }
    .tx-desc { font-weight: 500; }
    .tx-date { font-size: 12px; color: #888; }
    .tx-amount { font-weight: 700; font-size: 16px; }
    .tx-amount.income { color: #4caf50; }
    .tx-amount.expense { color: #f44336; }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  private transactionService = inject(TransactionService);

  loading = true;
  report: ReportResponse | null = null;
  recentTransactions: Transaction[] = [];

  now = new Date();
  currentMonthLabel = this.now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw as number;
            return ` R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    }
  };

  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        ticks: {
          callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`
        }
      }
    }
  };

  ngOnInit(): void {
    const month = this.now.getMonth() + 1;
    const year = this.now.getFullYear();

    this.reportService.getMonthlyReport(month, year).subscribe({
      next: (report) => {
        this.report = report;
        this.buildDoughnutChart(report);
        this.buildLineChart(report);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.transactionService.list({ page: 1, page_size: 5 }).subscribe({
      next: (resp) => { this.recentTransactions = resp.items; },
    });
  }

  private buildDoughnutChart(report: ReportResponse): void {
    this.doughnutData = {
      labels: report.by_category.map(c => `${c.category_icon} ${c.category_name}`),
      datasets: [{
        data: report.by_category.map(c => c.total),
        backgroundColor: report.by_category.map(c => c.category_color),
        hoverOffset: 8,
      }]
    };
  }

  private buildLineChart(report: ReportResponse): void {
    this.lineData = {
      labels: report.daily_trend.map(d => {
        const [y, m, day] = d.date.split('-');
        return `${day}/${m}`;
      }),
      datasets: [
        {
          label: 'Receitas',
          data: report.daily_trend.map(d => d.income),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76,175,80,0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Despesas',
          data: report.daily_trend.map(d => d.expenses),
          borderColor: '#f44336',
          backgroundColor: 'rgba(244,67,54,0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }
}
