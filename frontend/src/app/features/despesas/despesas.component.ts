import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../core/services/currency.service';

interface Gasto {
  id: number;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  moeda: string;
  valor_brl: number;
  valor_usd: number;
  metodo: string;
  conta: string;
  quem: string;
}

interface Investimento {
  id: number;
  data: string;
  valor_brl: number;
  valor_usd: number;
  metodo: string;
  conta: string;
  quem: string;
}

@Component({
  selector: 'app-despesas',
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.scss']
})
export class DespesasComponent implements OnInit {
  gastoForm: FormGroup;
  investimentoForm: FormGroup;

  gastos: Gasto[] = [];
  investimentos: Investimento[] = [];
  produtos: any[] = [];

  loading = false;
  currentMonth = '';

  categorias = [
    'Compra de Produto',
    'Mensalidade/Assinatura',
    'Contabilidade/Legal',
    'Taxas/Impostos',
    'Frete/Logística',
    'Marketing',
    'Outros'
  ];

  moedas = ['BRL', 'USD', 'EUR'];

  metodos = [
    'Pix',
    'Cartão de Crédito',
    'Boleto',
    'Transferência',
    'Dinheiro',
    'PayPal',
    'Wise'
  ];

  contas = [
    'Nubank',
    'Nomad',
    'Wise',
    'Mercury Bank',
    'WesternUnion',
    'PayPal'
  ];

  quemOptions = ['Bonette', 'Daniel'];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private currencyService: CurrencyService
  ) {
    const now = new Date();
    this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.gastoForm = this.fb.group({
      data: [now.toISOString().split('T')[0], Validators.required],
      categoria: ['Compra de Produto', Validators.required],
      descricao: [''],
      valor: [0, [Validators.required, Validators.min(0)]],
      moeda: ['BRL', Validators.required],
      metodo: ['Pix'],
      conta: ['Nubank'],
      quem: ['Bonette']
    });

    this.investimentoForm = this.fb.group({
      data: [now.toISOString().split('T')[0], Validators.required],
      valor_brl: [0],
      valor_usd: [0],
      metodo: ['Pix'],
      conta: ['Nubank'],
      quem: ['Bonette']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [gastos, investimentos, produtos] = await Promise.all([
        this.api.getGastos(this.currentMonth).toPromise(),
        this.api.getInvestimentos(this.currentMonth).toPromise(),
        this.api.getProdutos(this.currentMonth).toPromise()
      ]);

      this.gastos = gastos || [];
      this.investimentos = investimentos || [];
      this.produtos = produtos || [];

    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmitGasto() {
    if (this.gastoForm.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    try {
      await this.api.createGasto(this.gastoForm.value).toPromise();
      alert('Gasto adicionado com sucesso!');
      this.gastoForm.reset({
        data: new Date().toISOString().split('T')[0],
        categoria: 'Compra de Produto',
        moeda: 'BRL',
        metodo: 'Pix',
        conta: 'Nubank',
        quem: 'Bonette',
        valor: 0
      });
      this.loadData();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      alert('Erro ao adicionar gasto. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  async onSubmitInvestimento() {
    if (this.investimentoForm.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;
    try {
      await this.api.createInvestimento(this.investimentoForm.value).toPromise();
      alert('Investimento adicionado com sucesso!');
      this.investimentoForm.reset({
        data: new Date().toISOString().split('T')[0],
        metodo: 'Pix',
        conta: 'Nubank',
        quem: 'Bonette',
        valor_brl: 0,
        valor_usd: 0
      });
      this.loadData();
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      alert('Erro ao adicionar investimento. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  async deleteGasto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;

    this.loading = true;
    try {
      await this.api.deleteGasto(id).toPromise();
      alert('Gasto excluído com sucesso!');
      this.loadData();
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      alert('Erro ao excluir gasto.');
    } finally {
      this.loading = false;
    }
  }

  async deleteInvestimento(id: number) {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) return;

    this.loading = true;
    try {
      await this.api.deleteInvestimento(id).toPromise();
      alert('Investimento excluído com sucesso!');
      this.loadData();
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      alert('Erro ao excluir investimento.');
    } finally {
      this.loading = false;
    }
  }

  async deleteProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    this.loading = true;
    try {
      await this.api.deleteProduto(id).toPromise();
      alert('Produto excluído com sucesso!');
      this.loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    } finally {
      this.loading = false;
    }
  }

  formatCurrency(value: number, moeda: string): string {
    return this.currencyService.format(value, moeda);
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  }

  getTotalProduto(p: any): number {
    const qty = Number(p.quantidade || 0);
    const unit = Number(p.custo_base || 0);
    const prep = Number(p.prep || 0);
    const freight = Number(p.freight || 0);
    return (qty * (unit + prep)) + freight;
  }

  getMarginPct(p: any): string {
    const sold = Number(p.sold_for || 0);
    if (sold <= 0) return '-';

    const qty = Number(p.quantidade || 0);
    const base = Number(p.custo_base || 0);
    const tax = Number(p.tax || 0);
    const freight = Number(p.freight || 0);
    const prep = Number(p.prep || 0);
    const fees = Number(p.amazon_fees || 0);

    const rateio = qty > 0 ? (tax + freight) / qty : 0;
    const p2b = base + rateio;
    const gp = sold - fees - prep - p2b;
    const margin = (gp / sold) * 100;

    return `${margin.toFixed(1)}%`;
  }
}
