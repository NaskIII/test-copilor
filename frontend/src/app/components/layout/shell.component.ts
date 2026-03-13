import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="!(isHandset$ | async)"
        class="sidenav">
        <div class="sidenav-header">
          <span class="logo-icon">💰</span>
          <span class="logo-text">FinançasPro</span>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               (click)="closeSidenavOnMobile(sidenav)">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          @if (isHandset$ | async) {
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
            <mat-icon>account_circle</mat-icon>
            <span class="user-name">{{ (authService.currentUser$ | async)?.name }}</span>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="authService.logout()">
              <mat-icon>logout</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav {
      width: 240px;
      background: #1a237e;
      color: white;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 20px; font-weight: 700; color: white; }
    mat-nav-list a { color: rgba(255,255,255,0.8) !important; }
    mat-nav-list a:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }
    .active-link { background: rgba(255,255,255,0.15) !important; color: white !important; }
    .active-link mat-icon { color: white !important; }
    .toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-spacer { flex: 1; }
    .user-btn { display: flex; align-items: center; gap: 8px; }
    .user-name { margin-left: 4px; }
    .main-content { padding: 24px; }
    @media (max-width: 600px) { .main-content { padding: 16px; } }
  `]
})
export class ShellComponent implements OnInit {
  authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Lançamentos', icon: 'receipt_long', route: '/transactions' },
    { label: 'Relatórios', icon: 'bar_chart', route: '/reports' },
    { label: 'Categorias', icon: 'category', route: '/categories' },
    { label: 'Orçamentos', icon: 'account_balance_wallet', route: '/budgets' },
  ];

  isHandset$ = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    if (!this.authService.currentUser) {
      this.authService.loadCurrentUser().subscribe();
    }
  }

  closeSidenavOnMobile(sidenav: any): void {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe(result => {
      if (result.matches) sidenav.close();
    }).unsubscribe();
  }
}
