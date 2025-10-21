import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { PeriodService } from '../../core/services/period.service';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../core/services/currency.service';

type Num = number | null | undefined;

interface SaldoAmazon { disponivel?: number }
interface ResumoMes   { recUSD: number; recBRL: number; despUSD: number; despBRL: number }
interface Totais      { recUSD: number; recBRL: number; despUSD: number; despBRL: number }
interface Lucros      { lucroPeriodo: number; lucroTotal: number }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // período
  currentMonth = '';   // 'YYYY-MM'
  monthLabel  = '';    // 'setembro (2025)'
  private periodSub?: Subscription;

  // amazon / loading
  saldo: SaldoAmazon | null = null;
  refreshingSaldo = false;
  loading = false;

  // auto-refresh
  autoRefreshEnabled = true;
  nextRefreshIn = 0;              // seg
  private refreshInterval = 240;  // 4 min
  private timer?: any;

  // KPIs mês
  resumoMes: ResumoMes = { recUSD: 0, recBRL: 0, despUSD: 0, despBRL: 0 };
  resultadoMesUSD = 0;
  resultadoMesBRL = 0;

  // Totais (todos os meses)
  totais: Totais = { recUSD: 0, recBRL: 0, despUSD: 0, despBRL: 0 };
  resultadoTotalUSD = 0;
  resultadoTotalBRL = 0;

  // Lucros (ex.: em USD)
  lucros: Lucros = { lucroPeriodo: 0, lucroTotal: 0 };

  constructor(
    private period: PeriodService,
    private api: ApiService,
    private currency: CurrencyService
  ) {}

  // ================= lifecycle =================
  ngOnInit(): void {
    this.applyPeriod(this.period.value);
    this.periodSub = this.period.monthYear$.subscribe(v => this.applyPeriod(v));
    this.bootstrapAmazon();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.periodSub?.unsubscribe();
    if (this.timer) clearInterval(this.timer);
  }

  // ================= helpers =================
  private fmtMonthLabel(ym: string): string {
    const [y, m] = ym.split('-');
    const nomes = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const i = Math.max(1, Math.min(12, Number(m))) - 1;
    return `${nomes[i]} (${y})`;
  }

  private ensureArray<T>(v: T[] | null | undefined): T[] {
    return Array.isArray(v) ? v : [];
  }

  private applyPeriod(ym: string) {
    if (!ym) return;
    this.currentMonth = ym;
    this.monthLabel   = this.fmtMonthLabel(ym);
    this.loadMonthData();  // mês corrente
    this.loadTotals();     // totais (independem do mês)
  }

  // ================== Carga: MÊS ==================
  private async loadMonthData() {
    try {
      const ym = this.currentMonth;

      // seu ApiService:
      // - getReceitas(filters?: any)  -> usar objeto { month: ym }
      // - getGastos(month?: string)
      // - getInvestimentos(month?: string)
      const [receitasR, gastosR, investimentosR] = await Promise.all([
        firstValueFrom(this.api.getReceitas({ month: ym })),
        firstValueFrom(this.api.getGastos(ym)),
        firstValueFrom(this.api.getInvestimentos(ym))
      ]);

      const receitas      = this.ensureArray(receitasR);
      const gastos        = this.ensureArray(gastosR);
      const investimentos = this.ensureArray(investimentosR);

      const sum = (arr: any[], key: 'valor_usd'|'valor_brl') =>
        (arr || []).reduce((acc, x) => acc + Number(x?.[key] || 0), 0);

      const recUSD = sum(receitas, 'valor_usd');
      const recBRL = sum(receitas, 'valor_brl');

      const gasUSD = sum(gastos, 'valor_usd');
      const gasBRL = sum(gastos, 'valor_brl');

      const invUSD = sum(investimentos, 'valor_usd');
      const invBRL = sum(investimentos, 'valor_brl');

      // Despesa do mês = Gastos + Investimentos (passivo)
      this.resumoMes.recUSD  = recUSD;
      this.resumoMes.recBRL  = recBRL;
      this.resumoMes.despUSD = gasUSD + invUSD;
      this.resumoMes.despBRL = gasBRL + invBRL;

      this.resultadoMesUSD = this.resumoMes.recUSD - this.resumoMes.despUSD;
      this.resultadoMesBRL = this.resumoMes.recBRL - this.resumoMes.despBRL;

      this.lucros.lucroPeriodo = this.resultadoMesUSD;
    } catch (e) {
      console.error('Erro ao carregar dados do mês:', e);
      this.resumoMes = { recUSD: 0, recBRL: 0, despUSD: 0, despBRL: 0 };
      this.resultadoMesUSD = this.resultadoMesBRL = 0;
    }
  }

  // ============== Carga: TOTAIS (TODOS OS MESES) ==============
  private async loadTotals() {
    try {
      // sem filtro de mês -> soma TUDO do banco
      const [receitasR, gastosR, investimentosR] = await Promise.all([
        firstValueFrom(this.api.getReceitas()),     // todos
        firstValueFrom(this.api.getGastos()),       // todos
        firstValueFrom(this.api.getInvestimentos()) // todos
      ]);

      const receitas      = this.ensureArray(receitasR);
      const gastos        = this.ensureArray(gastosR);
      const investimentos = this.ensureArray(investimentosR);

      const sum = (arr: any[], key: 'valor_usd'|'valor_brl') =>
        (arr || []).reduce((acc, x) => acc + Number(x?.[key] || 0), 0);

      const recUSD = sum(receitas, 'valor_usd');
      const recBRL = sum(receitas, 'valor_brl');

      const gasUSD = sum(gastos, 'valor_usd');
      const gasBRL = sum(gastos, 'valor_brl');

      const invUSD = sum(investimentos, 'valor_usd');
      const invBRL = sum(investimentos, 'valor_brl');

      this.totais.recUSD  = recUSD;
      this.totais.recBRL  = recBRL;
      this.totais.despUSD = gasUSD + invUSD;
      this.totais.despBRL = gasBRL + invBRL;

      this.resultadoTotalUSD = this.totais.recUSD - this.totais.despUSD;
      this.resultadoTotalBRL = this.totais.recBRL - this.totais.despBRL;

      this.lucros.lucroTotal = this.resultadoTotalUSD;
    } catch (e) {
      console.error('Erro ao carregar totais:', e);
      this.totais = { recUSD: 0, recBRL: 0, despUSD: 0, despBRL: 0 };
      this.resultadoTotalUSD = this.resultadoTotalBRL = 0;
    }
  }

  // ================= Amazon =================
  private async bootstrapAmazon() {
    try {
      const s = await firstValueFrom(this.api.getAmazonSaldoLatest());
      if (s) this.saldo = s;
    } catch {}
  }

  async refreshSaldoAmazon() {
    try {
      this.refreshingSaldo = true;
      // se houver endpoint de refresh, chame-o aqui; fallback: reconsultar latest
      const s = await firstValueFrom(this.api.getAmazonSaldoLatest());
      if (s) this.saldo = s;
      this.nextRefreshIn = this.refreshInterval;
    } catch (e) {
      console.error('Erro ao atualizar saldo Amazon:', e);
    } finally {
      this.refreshingSaldo = false;
    }
  }

  async syncAmazonOrders() {
    // ajuste se tiver endpoint específico
    this.loading = true;
    try {
      // await firstValueFrom(this.api.syncAmazonOrders());
    } catch (e) {
      console.error('Erro ao sincronizar vendas Amazon:', e);
    } finally {
      this.loading = false;
    }
  }

  // ================= Auto-refresh =================
  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) this.startAutoRefresh();
    else if (this.timer) clearInterval(this.timer);
  }

  private startAutoRefresh() {
    this.nextRefreshIn = this.refreshInterval;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(async () => {
      if (!this.autoRefreshEnabled) return;
      this.nextRefreshIn = Math.max(0, this.nextRefreshIn - 1);
      if (this.nextRefreshIn === 0) {
        await this.refreshSaldoAmazon();
      }
    }, 1000);
  }

  // ================= utils do template =================
  formatUSD(v: Num): string { return this.currency.format(Number(v || 0), 'USD'); }
  formatBRL(v: Num): string { return this.currency.format(Number(v || 0), 'BRL'); }
  getResultClass(v: Num): string { return Number(v || 0) >= 0 ? 'green' : 'red'; }
  getMonthLabel(ym: string): string { return this.fmtMonthLabel(ym); }
  formatTime(totalSeconds: Num): string {
    const s = Math.max(0, Number(totalSeconds || 0));
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
