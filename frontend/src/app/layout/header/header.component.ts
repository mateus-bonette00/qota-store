import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() monthYearChange = new EventEmitter<string>();

  selectedMonth: string;
  selectedYear: number;
  years: number[] = [];

  navItems = [
    { route: '/dashboard', label: 'Principal', icon: 'home' },
    { route: '/receitas', label: 'Receitas', icon: 'dollar-sign' },
    { route: '/graficos', label: 'Gráficos', icon: 'trending-up' },
    { route: '/despesas', label: 'Despesas', icon: 'credit-card' },
    { route: '/produtos', label: 'Produtos', icon: 'package' },
    { route: '/senhas', label: 'Senhas', icon: 'lock' },
    { route: '/senhas-fornecedores', label: 'Senhas Fornec.', icon: 'key' },
    { route: '/informacoes-empresa', label: 'Info Empresa', icon: 'building-2' }
  ];

  constructor() {
    const now = new Date();
    this.selectedMonth = String(now.getMonth() + 1).padStart(2, '0');
    this.selectedYear = now.getFullYear();

    for (let y = this.selectedYear - 4; y <= this.selectedYear + 1; y++) {
      this.years.push(y);
    }
  }

  onMonthChange() {
    this.emitChange();
  }

  onYearChange() {
    this.emitChange();
  }

  private emitChange() {
    const monthYear = `${this.selectedYear}-${this.selectedMonth}`;
    this.monthYearChange.emit(monthYear);
  }

  getCurrentMonthYear(): string {
    return `${this.selectedYear}-${this.selectedMonth}`;
  }
}
