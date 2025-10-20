import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SenhasFornecedoresService } from '../../core/services/senhas-fornecedores.service';
import { SenhaFornecedor } from '../../core/models/senha-fornecedor.model';

@Component({
  selector: 'app-senhas-fornecedores',
  templateUrl: './senhas-fornecedores.component.html',
  styleUrls: ['./senhas-fornecedores.component.scss']
})
export class SenhasFornecedoresComponent implements OnInit {
  // Tabela
  senhas: SenhaFornecedor[] = [];

  // Formulário
  showForm = false;
  senhaForm: FormGroup;
  editingId: number | null = null;

  // Filtros
  searchTerm = '';

  // Loading
  loading = false;

  // Mostrar/ocultar senha
  showPassword: { [key: number]: boolean } = {};

  constructor(
    private senhasFornecedoresService: SenhasFornecedoresService,
    private fb: FormBuilder
  ) {
    this.senhaForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTableData();
  }

  // ---------- Formulário ----------
  private createForm(): FormGroup {
    return this.fb.group({
      nome_fornecedor: ['', Validators.required],
      url: [''],
      usuario_email: [''],
      senha: [''],
      observacoes: [''],
    });
  }

  // ---------- Carregamentos ----------
  loadTableData(): void {
    this.loading = true;
    this.senhasFornecedoresService.list().subscribe({
      next: (data) => {
        this.senhas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar senhas de fornecedores:', err);
        this.loading = false;
      },
    });
  }

  get filteredSenhas(): SenhaFornecedor[] {
    if (!this.searchTerm) {
      return this.senhas;
    }
    const term = this.searchTerm.toLowerCase();
    return this.senhas.filter(
      (s) =>
        s.nome_fornecedor?.toLowerCase().includes(term) ||
        s.url?.toLowerCase().includes(term) ||
        s.usuario_email?.toLowerCase().includes(term)
    );
  }

  // ---------- Eventos ----------
  onSenhaClicked(senha: SenhaFornecedor): void {
    this.editingId = senha.id!;
    this.senhaForm.patchValue(senha);
    this.showForm = true;
  }

  // ---------- CRUD ----------
  onSubmit(): void {
    if (this.senhaForm.invalid) return;
    const data = this.senhaForm.value;

    if (this.editingId) {
      this.senhasFornecedoresService.update(this.editingId, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTableData();
        },
        error: (err) => console.error('Erro ao atualizar:', err),
      });
    } else {
      this.senhasFornecedoresService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTableData();
        },
        error: (err) => console.error('Erro ao criar:', err),
      });
    }
  }

  deleteSenha(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta senha?')) return;
    this.senhasFornecedoresService.delete(id).subscribe({
      next: () => {
        this.loadTableData();
      },
      error: (err) => console.error('Erro ao deletar:', err),
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.senhaForm.reset();
  }

  // ---------- UI / Utils ----------
  togglePasswordVisibility(id: number): void {
    this.showPassword[id] = !this.showPassword[id];
  }

  copyToClipboard(text: string, field: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${field} copiado para a área de transferência!`);
    });
  }
}
