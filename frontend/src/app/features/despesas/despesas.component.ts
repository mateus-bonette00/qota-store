import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { CurrencyService } from '../../core/services/currency.service';
import type { Currency } from '../../core/services/currency.service';
import { PeriodService } from '../../core/services/period.service';

interface Gasto {
  id: number;
  data: string;         // 'YYYY-MM-DD'
  categoria: string;
  descricao: string;
  valor_usd: number;
  valor_brl: number;
  valor_eur: number;
  metodo: string;
  conta: string;
  quem: string;
}

interface Investimento {
  id: number;
  data: string;         // 'YYYY-MM-DD'
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
export class DespesasComponent implements OnInit, OnDestroy {
  gastoForm: FormGroup;
  investimentoForm: FormGroup;

  gastos: Gasto[] = [];
  investimentos: Investimento[] = [];
  produtos: any[] = [];

  loading = false;
  currentMonth = '';            // 'YYYY-MM'
  private periodSub?: Subscription;

  categorias = [
    'Compra de Produto',
    'Mensalidade/Assinatura',
    'Contabilidade/Legal',
    'Taxas/Impostos',
    'Frete/Logística',
    'Marketing',
    'Outros'
  ];

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
    private currencyService: CurrencyService,
    private period: PeriodService
  ) {
    const now = new Date();
    this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.gastoForm = this.fb.group({
      data: [now.toISOString().split('T')[0], Validators.required],
      categoria: ['Compra de Produto', Validators.required],
      descricao: [''],
      valor_usd: [null, [Validators.min(0)]],
      valor_brl: [null, [Validators.min(0)]],
      valor_eur: [null, [Validators.min(0)]],
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
    // escuta mudanças do período (vêm do seletor central)
    this.periodSub = this.period.monthYear$.subscribe(m => {
      if (m && m !== this.currentMonth) {
        this.currentMonth = m;
        this.loadData();
      }
    });

    // carrega inicial
    this.currentMonth = this.period.value || this.currentMonth;
    this.loadData();
  }

  ngOnDestroy() {
    this.periodSub?.unsubscribe();
  }

  private toCurrency(m: string | Currency | undefined): Currency {
    const up = String(m ?? 'USD').toUpperCase();
    return (['USD', 'BRL', 'EUR'] as const).includes(up as any) ? (up as Currency) : 'USD';
  }

  private yyyymm(dateStr: string): string {
    const d = String(dateStr).slice(0, 10);
    const [y, m] = d.split('-');
    return y && m ? `${y}-${m}` : '';
  }

  async loadData() {
    this.loading = true;
    try {
      const [gastos, investimentos, produtos] = await Promise.all([
        firstValueFrom(this.api.getGastos(this.currentMonth)),
        firstValueFrom(this.api.getInvestimentos(this.currentMonth)),
        firstValueFrom(this.api.getProdutos(this.currentMonth))
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
      const payload = this.gastoForm.value;
      const created = await firstValueFrom(this.api.createGasto(payload));

      const createdMonth = this.yyyymm(payload.data);

      // se a criação for no mesmo período atual, mostra imediatamente
      if (createdMonth === this.currentMonth && created && typeof created === 'object') {
        this.gastos = [created as Gasto, ...this.gastos];
      } else if (createdMonth && createdMonth !== this.currentMonth) {
        // muda o seletor global para o mês da despesa criada
        this.period.setMonthYear(createdMonth);
      }

      this.gastoForm.reset({
        data: new Date().toISOString().split('T')[0],
        categoria: 'Compra de Produto',
        descricao: '',
        valor_usd: null,
        valor_brl: null,
        valor_eur: null,
        metodo: 'Pix',
        conta: 'Nubank',
        quem: 'Bonette'
      });

      await this.loadData();
      alert('Gasto adicionado com sucesso!');
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
      const payload = this.investimentoForm.value;
      const created = await firstValueFrom(this.api.createInvestimento(payload));

      const createdMonth = this.yyyymm(payload.data);
      if (createdMonth === this.currentMonth && created && typeof created === 'object') {
        this.investimentos = [created as Investimento, ...this.investimentos];
      } else if (createdMonth && createdMonth !== this.currentMonth) {
        this.period.setMonthYear(createdMonth);
      }

      this.investimentoForm.reset({
        data: new Date().toISOString().split('T')[0],
        metodo: 'Pix',
        conta: 'Nubank',
        quem: 'Bonette',
        valor_brl: 0,
        valor_usd: 0
      });

      await this.loadData();
      alert('Investimento adicionado com sucesso!');
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
      await firstValueFrom(this.api.deleteGasto(id));
      this.gastos = this.gastos.filter(g => g.id !== id);
      await this.loadData();
      alert('Gasto excluído com sucesso!');
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
      await firstValueFrom(this.api.deleteInvestimento(id));
      this.investimentos = this.investimentos.filter(i => i.id !== id);
      await this.loadData();
      alert('Investimento excluído com sucesso!');
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
      await firstValueFrom(this.api.deleteProduto(id));
      this.produtos = this.produtos.filter(p => p.id !== id);
      await this.loadData();
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto.');
    } finally {
      this.loading = false;
    }
  }

  formatCurrency(value: number, moeda: string | Currency): string {
    return this.currencyService.format(value, this.toCurrency(moeda));
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateStr = String(date).split('T')[0];
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    return dateStr;
  }

  getTotalProduto(p: any): number {
    const qty = Number(p.quantidade || 0);
    const unit = Number(p.custo_base || 0);
    const prep = Number(p.prep || 0);
    const freight = Number(p.freight || 0);
    return qty * (unit + prep) + freight;
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
