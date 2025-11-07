import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProdutosService } from '../../core/services/produtos.service';
import { CurrencyService } from '../../core/services/currency.service';

// Modelos do app
import {
  ProdutoWithMetrics,
  ProdutoStatus,
} from '../../core/models/produto.model';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss'],
})
export class ProdutosComponent implements OnInit {
  // Tabela
  produtos: ProdutoWithMetrics[] = [];

  // Formulário
  showForm = false;
  produtoForm: FormGroup;
  editingId: number | null = null;

  // Filtros
  searchTerm = '';
  selectedCategoria = '';
  selectedFornecedor = '';
  categorias: string[] = [];
  fornecedores: string[] = [];

  // Loading
  loading = false;

  constructor(
    private produtosService: ProdutosService,
    private currencyService: CurrencyService,
    private fb: FormBuilder
  ) {
    this.produtoForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTableData();
    this.loadFilters();
  }

  // ---------- Formulário ----------
  private createForm(): FormGroup {
    return this.fb.group({
      // Básico
      nome: ['', Validators.required],
      sku: [''],
      upc: [''],
      asin: [''],

      // Status
      status: ['sourcing', Validators.required],

      // Categoria / fornecedor
      categoria: [''],
      fornecedor: [''],

      // Datas
      data_add: [new Date().toISOString().split('T')[0], Validators.required],
      data_amz: [''],

      // Quantidade
      estoque: [0, [Validators.required, Validators.min(0)]],
      quantidade: [0, [Validators.required, Validators.min(0)]],

      // Custos (por unidade)
      custo_base: [0, [Validators.required, Validators.min(0)]],
      freight: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
      prep: [2, [Validators.required, Validators.min(0)]], // default $2

      // Moeda
      moeda_compra: ['USD', Validators.required],

      // Venda
      sold_for: [0, [Validators.required, Validators.min(0)]],
      amazon_fees: [0, [Validators.required, Validators.min(0)]],

      // Links
      link_amazon: [''],
      link_fornecedor: [''],
    });
  }

  // ---------- Carregamentos ----------
  private buildFilterParams() {
    return {
      q: this.searchTerm || undefined,
      categoria: this.selectedCategoria || undefined,
      fornecedor: this.selectedFornecedor || undefined,
    };
  }

  loadTableData(): void {
    this.loading = true;
    this.produtosService.list(this.buildFilterParams() as any).subscribe({
      next: (data) => {
        this.produtos = data as ProdutoWithMetrics[];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      },
    });
  }

  loadFilters(): void {
    // Busca categorias/fornecedores a partir de todos os produtos
    this.produtosService.list().subscribe({
      next: (produtos) => {
        const cats = new Set<string>();
        const forn = new Set<string>();
        produtos.forEach((p: any) => {
          if (p.categoria) cats.add(p.categoria);
          if (p.fornecedor) forn.add(p.fornecedor);
        });
        this.categorias = Array.from(cats).sort();
        this.fornecedores = Array.from(forn).sort();
      },
    });
  }

  // ---------- Eventos ----------
  onProductClicked(produto: ProdutoWithMetrics): void {
    this.editingId = produto.id!;
    this.produtoForm.patchValue({
      ...produto,
      // garante valores numéricos no form
      custo_base: Number(produto.custo_base ?? 0),
      freight: Number(produto.freight ?? 0),
      tax: Number(produto.tax ?? 0),
      prep: Number(produto.prep ?? 0),
      sold_for: Number(produto.sold_for ?? 0),
      amazon_fees: Number(produto.amazon_fees ?? 0),
    });
    this.showForm = true;
  }

  // ---------- CRUD ----------
  onSubmit(): void {
    if (this.produtoForm.invalid) return;
    const data = {
      ...this.produtoForm.value,
      // força números (evita enviar string)
      custo_base: +this.produtoForm.value.custo_base,
      freight: +this.produtoForm.value.freight,
      tax: +this.produtoForm.value.tax,
      prep: +this.produtoForm.value.prep,
      sold_for: +this.produtoForm.value.sold_for,
      amazon_fees: +this.produtoForm.value.amazon_fees,
      estoque: +this.produtoForm.value.estoque,
      quantidade: +this.produtoForm.value.quantidade,
    };

    if (this.editingId) {
      this.produtosService.update(this.editingId, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTableData();
        },
        error: (err) => console.error('Erro ao atualizar:', err),
      });
    } else {
      this.produtosService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTableData();
        },
        error: (err) => console.error('Erro ao criar:', err),
      });
    }
  }

  deleteProduto(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    this.produtosService.delete(id).subscribe({
      next: () => {
        this.loadTableData();
      },
      error: (err) => console.error('Erro ao deletar:', err),
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.produtoForm.reset();
    this.produtoForm.patchValue({
      status: 'sourcing',
      moeda_compra: 'USD',
      prep: 2,
      data_add: new Date().toISOString().split('T')[0],
    });
  }

  // ---------- UI / Utils ----------
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      sourcing: '🔍 Pesquisando',
      comprado: '🟠 Aguardando Aprovação',
      em_transito: '🟡 Pendente',
      no_estoque: '✅ Aprovado/Vendendo',
      vendido: '🟣 Vendido',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      sourcing: '#EF4444',
      comprado: '#F97316',
      em_transito: '#EAB308',
      no_estoque: '#22C55E',
      vendido: '#A855F7',
    };
    return colors[status] ?? '#ccc';
  }

  // ---------- Cálculos de Margem ----------

  /**
   * Calcula o custo total por unidade incluindo frete
   * Fórmula: custo_base + (freight / quantidade)
   */
  calcularCustoTotalUnitario(): number {
    const v = this.produtoForm.value;
    const custoBase = +v.custo_base || 0;
    const freight = +v.freight || 0;
    const quantidade = +v.quantidade || 1; // evitar divisão por zero

    return custoBase + (freight / quantidade);
  }

  /**
   * Calcula o Gross Profit (lucro bruto)
   * Fórmula: sold_for - amazon_fees - prep - custo_base
   */
  calcularGrossProfit(): number {
    const v = this.produtoForm.value;
    const soldFor = +v.sold_for || 0;
    const amazonFees = +v.amazon_fees || 0;
    const prep = +v.prep || 0;
    const custoBase = +v.custo_base || 0;

    return soldFor - amazonFees - prep - custoBase;
  }

  /**
   * Calcula o Gross ROI (retorno sobre investimento)
   * Fórmula: (Gross Profit / custo_base) × 100
   */
  calcularGrossROI(): number {
    const grossProfit = this.calcularGrossProfit();
    const custoBase = +this.produtoForm.value.custo_base || 0;

    return custoBase > 0 ? (grossProfit / custoBase) * 100 : 0;
  }

  /**
   * Calcula a Margem de Lucro (%)
   * Fórmula: (Gross Profit / sold_for) × 100
   */
  calcularMargemEstimada(): number {
    const grossProfit = this.calcularGrossProfit();
    const soldFor = +this.produtoForm.value.sold_for || 0;

    return soldFor > 0 ? (grossProfit / soldFor) * 100 : 0;
  }

  autoCalcularAmazonFees(): void {
    const soldFor = +this.produtoForm.get('sold_for')?.value || 0;
    const fees = soldFor * 0.15;
    this.produtoForm.patchValue({ amazon_fees: Number(fees.toFixed(2)) });
  }

  buscarPorASIN(): void {
    const asin = this.produtoForm.get('asin')?.value;
    if (!asin) return;
    console.log('Buscando produto ASIN:', asin);
    // integrar aqui com endpoint/serviço que consulta a Amazon (quando desejar)
  }
}
