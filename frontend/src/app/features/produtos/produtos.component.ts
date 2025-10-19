import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProdutosService } from '../../core/services/produtos.service';
import { CurrencyService } from '../../core/services/currency.service';
import { KanbanColumn, KanbanCardMoveEvent } from '../../shared/components/kanban-board/kanban-board.component';
import { ProdutoWithMetrics, ProdutoStatus } from '../../core/models/produto.model';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit {
  @ViewChild('productCardTemplate') productCardTemplate!: TemplateRef<any>;

  // Kanban
  kanbanColumns: KanbanColumn[] = [];
  viewMode: 'kanban' | 'table' = 'kanban';

  // Table
  produtos: ProdutoWithMetrics[] = [];

  // Form
  showForm = false;
  produtoForm: FormGroup;
  editingId: number | null = null;

  // Filters
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

  ngOnInit() {
    if (this.viewMode === 'kanban') {
      this.loadKanbanData();
    } else {
      this.loadTableData();
    }
    this.loadFilters();
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informações básicas
      nome: ['', Validators.required],
      sku: [''],
      upc: [''],
      asin: [''],

      // Kanban status
      status: ['sourcing', Validators.required],

      // Categoria e fornecedor
      categoria: [''],
      fornecedor: [''],

      // Datas
      data_add: [new Date().toISOString().split('T')[0], Validators.required],
      data_amz: [''],

      // Quantidade
      estoque: [0, [Validators.required, Validators.min(0)]],
      quantidade: [0, [Validators.required, Validators.min(0)]],

      // Custos (USD)
      custo_base: [0, [Validators.required, Validators.min(0)]],
      freight: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
      prep: [2, [Validators.required, Validators.min(0)]], // Default $2

      // Moeda de compra
      moeda_compra: ['USD', Validators.required],

      // Venda
      sold_for: [0, [Validators.required, Validators.min(0)]],
      amazon_fees: [0, [Validators.required, Validators.min(0)]],

      // Links
      link_amazon: [''],
      link_fornecedor: ['']
    });
  }

  loadKanbanData() {
    this.loading = true;
    this.produtosService.getKanbanData().subscribe({
      next: (data) => {
        this.kanbanColumns = data.map(col => ({
          id: col.status,
          title: this.getStatusLabel(col.status),
          items: col.produtos,
          color: this.getStatusColor(col.status)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar Kanban:', err);
        this.loading = false;
      }
    });
  }

  loadTableData() {
    this.loading = true;
    this.produtosService.list().subscribe({
      next: (data) => {
        this.produtos = data as ProdutoWithMetrics[];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      }
    });
  }

  loadFilters() {
    // Buscar categorias e fornecedores únicos
    this.produtosService.list().subscribe({
      next: (produtos) => {
        const cats = new Set<string>();
        const forn = new Set<string>();

        produtos.forEach(p => {
          if (p.categoria) cats.add(p.categoria);
          if (p.fornecedor) forn.add(p.fornecedor);
        });

        this.categorias = Array.from(cats).sort();
        this.fornecedores = Array.from(forn).sort();
      }
    });
  }

  onProductMoved(event: KanbanCardMoveEvent) {
    const produto = event.item;
    const newStatus = event.currentColumnId as ProdutoStatus;

    this.produtosService.updateStatus(produto.id, newStatus).subscribe({
      next: () => {
        console.log(`Produto ${produto.nome} movido para ${newStatus}`);
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        // Revert on error
        this.loadKanbanData();
      }
    });
  }

  onProductClicked(produto: ProdutoWithMetrics) {
    this.editingId = produto.id!;
    this.produtoForm.patchValue(produto);
    this.showForm = true;
  }

  onSubmit() {
    if (this.produtoForm.invalid) return;

    const data = this.produtoForm.value;

    if (this.editingId) {
      // Update
      this.produtosService.update(this.editingId, data).subscribe({
        next: () => {
          this.closeForm();
          this.reload();
        },
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      // Create
      this.produtosService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.reload();
        },
        error: (err) => console.error('Erro ao criar:', err)
      });
    }
  }

  deleteProduto(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    this.produtosService.delete(id).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Erro ao deletar:', err)
    });
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.produtoForm.reset();
    this.produtoForm.patchValue({
      status: 'sourcing',
      moeda_compra: 'USD',
      prep: 2,
      data_add: new Date().toISOString().split('T')[0]
    });
  }

  reload() {
    if (this.viewMode === 'kanban') {
      this.loadKanbanData();
    } else {
      this.loadTableData();
    }
  }

  switchView(mode: 'kanban' | 'table') {
    this.viewMode = mode;
    this.reload();
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'sourcing': '🔍 Pesquisando',
      'comprado': '🟠 Aguardando Aprovação',
      'em_transito': '🟡 Pendente',
      'no_estoque': '✅ Aprovado/Vendendo',
      'vendido': '🟣 Vendido'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'sourcing': '#EF4444', // Vermelho
      'comprado': '#F97316', // Laranja
      'em_transito': '#EAB308', // Amarelo
      'no_estoque': '#22C55E', // Verde
      'vendido': '#A855F7' // Roxo
    };
    return colors[status] || '#ccc';
  }

  calcularMargemEstimada(): number {
    const values = this.produtoForm.value;
    const custoTotal = values.custo_base + values.freight + values.tax + values.prep;
    const lucro = values.sold_for - values.amazon_fees - custoTotal;
    return values.sold_for > 0 ? (lucro / values.sold_for) * 100 : 0;
  }

  autoCalcularAmazonFees() {
    const soldFor = this.produtoForm.get('sold_for')?.value || 0;
    const fees = soldFor * 0.15; // 15% default
    this.produtoForm.patchValue({ amazon_fees: fees.toFixed(2) });
  }

  // Integração com Amazon - Buscar produto por ASIN
  buscarPorASIN() {
    const asin = this.produtoForm.get('asin')?.value;
    if (!asin) return;

    // Aqui você pode integrar com Amazon SP-API para buscar dados
    console.log('Buscando produto ASIN:', asin);
  }
}
