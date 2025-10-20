import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnInit {
  // Filtros
  selectedMonth: string = '';
  selectedYear: string = '';

  // Gráficos
  receitasDespesasChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  receitasDespesasChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Receitas x Despesas (USD)' }
    }
  };

  resultadoMesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  resultadoMesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Resultado por mês (USD)' }
    }
  };

  topProdutosMesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  topProdutosMesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top produtos (MÊS) — mais vendidos' }
    }
  };

  bottomProdutosMesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  bottomProdutosMesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bottom produtos (MÊS) — menos vendidos' }
    }
  };

  topProdutosAnoChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  topProdutosAnoChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top produtos (ANO) — mais vendidos' }
    }
  };

  bottomProdutosAnoChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  bottomProdutosAnoChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bottom produtos (ANO) — menos vendidos' }
    }
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const now = new Date();
    this.selectedMonth = String(now.getMonth() + 1).padStart(2, '0');
    this.selectedYear = String(now.getFullYear());

    this.loadGraficos();
  }

  onMonthChange(): void {
    this.loadGraficos();
  }

  loadGraficos(): void {
    this.loadReceitasDespesasChart();
    this.loadResultadoMesChart();
    this.loadTopBottomProdutos();
  }

  loadReceitasDespesasChart(): void {
    this.apiService.getSerieMensal().subscribe({
      next: (data: any[]) => {
        const labels = data.map(d => d.mes);
        const receitas = data.map(d => d.receitas_usd || 0);
        const despesas = data.map(d => d.despesas_usd || 0);

        this.receitasDespesasChartData = {
          labels,
          datasets: [
            {
              label: 'Receitas (Amazon)',
              data: receitas,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            },
            {
              label: 'Despesas Totais',
              data: despesas,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4
            }
          ]
        };
      },
      error: (err) => console.error('Erro ao carregar série mensal:', err)
    });
  }

  loadResultadoMesChart(): void {
    this.apiService.getSerieMensal().subscribe({
      next: (data: any[]) => {
        const labels = data.map(d => d.mes);
        const resultado = data.map(d => (d.receitas_usd || 0) - (d.despesas_usd || 0));

        this.resultadoMesChartData = {
          labels,
          datasets: [
            {
              label: 'Resultado',
              data: resultado,
              backgroundColor: resultado.map(v => v >= 0 ? '#10b981' : '#ef4444')
            }
          ]
        };
      },
      error: (err) => console.error('Erro ao carregar resultado mensal:', err)
    });
  }

  loadTopBottomProdutos(): void {
    // Top produtos do mês
    this.apiService.getProductSales('month', 'desc', 5, this.selectedYear, this.selectedMonth).subscribe({
      next: (data: any[]) => {
        this.topProdutosMesChartData = {
          labels: data.map(p => p.sku || p.nome),
          datasets: [{
            label: 'Quantidade',
            data: data.map(p => p.quantidade_total),
            backgroundColor: '#3b82f6'
          }]
        };
      },
      error: (err) => console.error('Erro ao carregar top produtos mês:', err)
    });

    // Bottom produtos do mês
    this.apiService.getProductSales('month', 'asc', 5, this.selectedYear, this.selectedMonth).subscribe({
      next: (data: any[]) => {
        this.bottomProdutosMesChartData = {
          labels: data.map(p => p.sku || p.nome),
          datasets: [{
            label: 'Quantidade',
            data: data.map(p => p.quantidade_total),
            backgroundColor: '#ef4444'
          }]
        };
      },
      error: (err) => console.error('Erro ao carregar bottom produtos mês:', err)
    });

    // Top produtos do ano
    this.apiService.getProductSales('year', 'desc', 5, this.selectedYear).subscribe({
      next: (data: any[]) => {
        this.topProdutosAnoChartData = {
          labels: data.map(p => p.sku || p.nome),
          datasets: [{
            label: 'Quantidade',
            data: data.map(p => p.quantidade_total),
            backgroundColor: '#3b82f6'
          }]
        };
      },
      error: (err) => console.error('Erro ao carregar top produtos ano:', err)
    });

    // Bottom produtos do ano
    this.apiService.getProductSales('year', 'asc', 5, this.selectedYear).subscribe({
      next: (data: any[]) => {
        this.bottomProdutosAnoChartData = {
          labels: data.map(p => p.sku || p.nome),
          datasets: [{
            label: 'Quantidade',
            data: data.map(p => p.quantidade_total),
            backgroundColor: '#ef4444'
          }]
        };
      },
      error: (err) => console.error('Erro ao carregar bottom produtos ano:', err)
    });
  }
}
