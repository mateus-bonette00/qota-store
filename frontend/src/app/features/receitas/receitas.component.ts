import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Receita, ReceitaSummary } from '../../core/models/receita.model';
import { format } from 'date-fns';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-receitas',
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.scss']
})
export class ReceitasComponent implements OnInit {
  // Controle de abas
  activeTab: 'receitas' | 'graficos' | 'despesas' | 'produtos-comprados' = 'receitas';

  // Filtros
  selectedMonth: string = '';
  selectedYear: string = '';

  // Dados de receitas
  receitas: Receita[] = [];
  summary: ReceitaSummary | null = null;

  // Form de nova receita
  novaReceita: Partial<Receita> = {
    data: format(new Date(), 'yyyy-MM-dd'),
    quantidade: 1,
    moeda: 'USD',
    origem: 'FBA',
    valor: 20.09,
    bruto: 0,
    cogs: 0,
    taxas_amz: 0,
    ads: 0,
    frete: 0,
    descontos: 0,
    lucro: 0
  };

  // Produtos para o dropdown
  produtos: any[] = [];

  // Loading states
  loading = false;
  loadingSummary = false;

  // Gráficos
  receitasDespesasChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  receitasDespesasChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Receitas x Despesas (USD) — outubro (2025)' }
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

    this.loadReceitas();
    this.loadSummary();
    this.loadProdutos();
    this.loadGraficos();
  }

  setTab(tab: 'receitas' | 'graficos' | 'despesas' | 'produtos-comprados'): void {
    this.activeTab = tab;
    if (tab === 'graficos') {
      this.loadGraficos();
    }
  }

  loadReceitas(): void {
    this.loading = true;
    const mes = `${this.selectedYear}-${this.selectedMonth}`;

    this.apiService.getReceitas({ mes }).subscribe({
      next: (data) => {
        this.receitas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar receitas:', err);
        this.loading = false;
      }
    });
  }

  loadSummary(): void {
    this.loadingSummary = true;
    const mes = `${this.selectedYear}-${this.selectedMonth}`;

    this.apiService.getReceitasSummary({ mes }).subscribe({
      next: (data) => {
        this.summary = data;
        this.loadingSummary = false;
      },
      error: (err) => {
        console.error('Erro ao carregar resumo:', err);
        this.loadingSummary = false;
      }
    });
  }

  loadProdutos(): void {
    this.apiService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      }
    });
  }

  onMonthChange(): void {
    this.loadReceitas();
    this.loadSummary();
  }

  onProdutoSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const produtoSelecionado = this.produtos.find(p => p.id === Number(select.value));

    if (produtoSelecionado) {
      this.novaReceita.produto_id = produtoSelecionado.id;
      this.novaReceita.sku = produtoSelecionado.sku;
      this.novaReceita.asin = produtoSelecionado.asin;
    }
  }

  adicionarRecebimento(): void {
    // Validações básicas
    if (!this.novaReceita.data || !this.novaReceita.quantidade) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    // Criar payload
    const payload: any = {
      data: this.novaReceita.data,
      produto_id: this.novaReceita.produto_id,
      sku: this.novaReceita.sku || '',
      quantidade: this.novaReceita.quantidade,
      valor: this.novaReceita.valor || 0,
      moeda: this.novaReceita.moeda || 'USD',
      origem: this.novaReceita.origem || 'FBA',
      quem: this.novaReceita.quem || '',
      obs: this.novaReceita.descricao || '',
      bruto: this.novaReceita.bruto || 0,
      cogs: this.novaReceita.cogs || 0,
      taxas_amz: this.novaReceita.taxas_amz || 0,
      ads: this.novaReceita.ads || 0,
      frete: this.novaReceita.frete || 0,
      descontos: this.novaReceita.descontos || 0,
      lucro: this.novaReceita.lucro || 0
    };

    this.apiService.createReceita(payload).subscribe({
      next: (receita) => {
        console.log('Receita criada:', receita);
        this.loadReceitas();
        this.loadSummary();
        this.resetForm();
      },
      error: (err) => {
        console.error('Erro ao criar receita:', err);
        alert('Erro ao adicionar recebimento');
      }
    });
  }

  excluirReceita(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) {
      return;
    }

    this.apiService.deleteReceita(id).subscribe({
      next: () => {
        this.loadReceitas();
        this.loadSummary();
      },
      error: (err) => {
        console.error('Erro ao excluir receita:', err);
        alert('Erro ao excluir receita');
      }
    });
  }

  resetForm(): void {
    this.novaReceita = {
      data: format(new Date(), 'yyyy-MM-dd'),
      quantidade: 1,
      moeda: 'USD',
      origem: 'FBA',
      valor: 20.09,
      bruto: 0,
      cogs: 0,
      taxas_amz: 0,
      ads: 0,
      frete: 0,
      descontos: 0,
      lucro: 0
    };
  }

  loadGraficos(): void {
    this.loadReceitasDespesasChart();
    this.loadResultadoMesChart();
    this.loadTopBottomProdutos();
  }

  loadReceitasDespesasChart(): void {
    // Mock data - você pode substituir pela chamada real da API
    const mes = `${this.selectedYear}-${this.selectedMonth}`;

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
    const mes = `${this.selectedYear}-${this.selectedMonth}`;

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
