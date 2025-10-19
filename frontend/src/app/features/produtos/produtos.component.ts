import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ProdutosService } from '../../core/services/produtos.service';
import { CurrencyService } from '../../core/services/currency.service';
import { WebsocketService } from '../../core/services/websocket.service';

// Tipos que o seu Kanban Board expõe
import {
  KanbanColumn,
  KanbanCardMoveEvent,
} from '../../shared/components/kanban-board/kanban-board.component';

// Modelos do app
import {
  ProdutoWithMetrics,
  ProdutoStatus,
} from '../../core/models/produto.model';

type ViewMode = 'kanban' | 'table';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss'],
})
export class ProdutosComponent implements OnInit, OnDestroy {
  @ViewChild('productCardTemplate', { static: true })
  productCardTemplate!: TemplateRef<any>;

  // Kanban
  kanbanColumns: KanbanColumn[] = [];
  viewMode: ViewMode = 'kanban';

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

  // WS
  private subs = new Subscription();

  constructor(
    private produtosService: ProdutosService,
    private currencyService: CurrencyService,
    private fb: FormBuilder,
    private ws: WebsocketService
  ) {
    this.produtoForm = this.createForm();
  }

  ngOnInit(): void {
    // abre WS (se você já abre no AppComponent, pode remover)
    this.ws.connect();

    // carrega dados conforme a view atual
    this.reload();
    this.loadFilters();

    // auto-refresh quando alguém mover/alterar produto
    this.subs.add(
      this.ws.fromEvent('product:moved').subscribe(() => this.reload())
    );
    this.subs.add(
      this.ws.fromEvent('kanban:refresh').subscribe(() => this.reload())
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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

  loadKanbanData(): void {
    this.loading = true;
    this.produtosService.getKanbanData().subscribe({
      next: (data) => {
        // mapeia para o formato do seu <app-kanban-board>
        this.kanbanColumns = (data || []).map((col: any) => ({
          id: col.status,
          title: this.getStatusLabel(col.status),
          items: col.produtos,
          color: this.getStatusColor(col.status),
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar Kanban:', err);
        this.loading = false;
      },
    });
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

  // ---------- Eventos do Kanban ----------
  onProductMoved(event: KanbanCardMoveEvent): void {
    const produto = event.item as ProdutoWithMetrics;
    const newStatus = event.currentColumnId as ProdutoStatus;

    // update no backend
    this.produtosService.updateStatus(produto.id!, newStatus).subscribe({
      next: () => {
        // otimista já moveu visualmente; notifica outros clientes
        this.ws.emit('product:moved', {
          productId: produto.id,
          to: newStatus,
          toIndex: event.currentIndex,
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        // reverte se falhar
        this.loadKanbanData();
      },
    });
  }

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
          this.reload();
          this.ws.emit('kanban:refresh', {}); // opcional: força refresh
        },
        error: (err) => console.error('Erro ao atualizar:', err),
      });
    } else {
      this.produtosService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.reload();
          this.ws.emit('kanban:refresh', {});
        },
        error: (err) => console.error('Erro ao criar:', err),
      });
    }
  }

  deleteProduto(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    this.produtosService.delete(id).subscribe({
      next: () => {
        this.reload();
        this.ws.emit('kanban:refresh', {});
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
  reload(): void {
    if (this.viewMode === 'kanban') this.loadKanbanData();
    else this.loadTableData();
  }

  switchView(mode: ViewMode): void {
    this.viewMode = mode;
    this.reload();
  }

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

  calcularMargemEstimada(): number {
    const v = this.produtoForm.value;
    const custoTotal =
      (+v.custo_base || 0) + (+v.freight || 0) + (+v.tax || 0) + (+v.prep || 0);
    const lucro = (+v.sold_for || 0) - (+v.amazon_fees || 0) - custoTotal;
    return (+v.sold_for || 0) > 0 ? (lucro / +v.sold_for) * 100 : 0;
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
