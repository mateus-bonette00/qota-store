import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AmazonService } from '../../core/services/amazon.service';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  refreshingSaldo = false;
  currentMonth = '';

  saldo: any = null;
  resumoMes: any = null;
  totais: any = null;
  lucros: any = null;

  resultadoMesUSD = 0;
  resultadoMesBRL = 0;
  resultadoTotalUSD = 0;
  resultadoTotalBRL = 0;

  // Auto-refresh
  private refreshSubscription?: Subscription;
  autoRefreshEnabled = true;
  nextRefreshIn = 300; // 5 minutos

  constructor(
    private api: ApiService,
    private amazonService: AmazonService,
    private currencyService: CurrencyService
  ) {
    const now = new Date();
    this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  ngOnInit() {
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  /**
   * Carregar todos os dados
   */
  async loadData() {
    this.loading = true;
    try {
      const [saldo, resumoMes, totais, lucros] = await Promise.all([
        this.amazonService.getBalance(false).toPromise(),
        this.api.getResumoMensal(this.currentMonth).toPromise(),
        this.api.getTotaisAcumulados().toPromise(),
        this.api.getLucros(this.currentMonth).toPromise()
      ]);

      this.saldo = saldo;
      this.resumoMes = resumoMes;
      this.totais = totais;
      this.lucros = lucros;

      this.calcularResultados();

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Atualizar saldo Amazon (forçar da API)
   */
  async refreshSaldoAmazon() {
    this.refreshingSaldo = true;
    try {
      const saldo = await this.amazonService.getBalance(true).toPromise();
      this.saldo = saldo;

      // Mostrar notificação de sucesso
      alert('Saldo atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar saldo:', error);
      alert('Erro ao atualizar saldo. Verifique as credenciais da API Amazon.');
    } finally {
      this.refreshingSaldo = false;
    }
  }

  /**
   * Sincronizar vendas da Amazon
   */
  async syncAmazonOrders() {
    if (!confirm('Deseja sincronizar as vendas dos últimos 7 dias da Amazon?')) {
      return;
    }

    this.loading = true;
    try {
      const result = await this.amazonService.syncOrders(7).toPromise();
      alert(result.message);
      this.loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar vendas. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Calcular resultados (receitas - despesas)
   */
  private calcularResultados() {
    this.resultadoMesUSD = (this.resumoMes?.recUSD || 0) - (this.resumoMes?.despUSD || 0);
    this.resultadoMesBRL = (this.resumoMes?.recBRL || 0) - (this.resumoMes?.despBRL || 0);
    this.resultadoTotalUSD = (this.totais?.recUSD || 0) - (this.totais?.despUSD || 0);
    this.resultadoTotalBRL = (this.totais?.recBRL || 0) - (this.totais?.despBRL || 0);
  }

  /**
   * Auto-refresh a cada 5 minutos
   */
  private startAutoRefresh() {
    if (!this.autoRefreshEnabled) return;

    this.refreshSubscription = interval(1000).subscribe(() => {
      this.nextRefreshIn--;

      if (this.nextRefreshIn <= 0) {
        this.nextRefreshIn = 300; // Reset para 5 min
        this.loadData();
      }
    });
  }

  private stopAutoRefresh() {
    this.refreshSubscription?.unsubscribe();
  }

  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;

    if (this.autoRefreshEnabled) {
      this.nextRefreshIn = 300;
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  /**
   * Formatação
   */
  formatUSD(value: number | undefined): string {
    if (!value) return '$ 0.00';
    return `$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatBRL(value: number | undefined): string {
    if (!value) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getResultClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getMonthLabel(monthStr: string): string {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const idx = parseInt(month, 10) - 1;
    return `${months[idx]} (${year})`;
  }
}
