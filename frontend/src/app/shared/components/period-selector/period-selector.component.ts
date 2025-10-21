import { Component, OnInit } from '@angular/core';
import { PeriodService } from '../../../core/services/period.service';

@Component({
  selector: 'app-period-selector',
  templateUrl: './period-selector.component.html',
  styleUrls: ['./period-selector.component.scss']
})
export class PeriodSelectorComponent implements OnInit {
  months = [
    { v: '01', n: 'Janeiro' }, { v: '02', n: 'Fevereiro' }, { v: '03', n: 'Março' },
    { v: '04', n: 'Abril' },   { v: '05', n: 'Maio' },      { v: '06', n: 'Junho' },
    { v: '07', n: 'Julho' },   { v: '08', n: 'Agosto' },    { v: '09', n: 'Setembro' },
    { v: '10', n: 'Outubro' }, { v: '11', n: 'Novembro' },  { v: '12', n: 'Dezembro' }
  ];
  years: number[] = [];

  selectedMonth = '01';
  selectedYear = new Date().getFullYear();

  constructor(private period: PeriodService) {}

  ngOnInit(): void {
    const now = new Date();
    const baseYear = now.getFullYear();
    for (let y = baseYear - 4; y <= baseYear + 1; y++) this.years.push(y);

    // carregar do serviço
    const [y, m] = this.period.value.split('-');
    if (y && m) {
      this.selectedYear = Number(y);
      this.selectedMonth = m;
    } else {
      this.selectedYear = baseYear;
      this.selectedMonth = String(now.getMonth() + 1).padStart(2, '0');
      this.emitChange();
    }
  }

  onChange() {
    this.emitChange();
  }

  private emitChange() {
    const monthYear = `${this.selectedYear}-${this.selectedMonth}`;
    this.period.setMonthYear(monthYear);
  }
}
