import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SenhasService } from '../../core/services/senhas.service';
import { Senha } from '../../core/models/senha.model';

@Component({
  selector: 'app-senhas',
  templateUrl: './senhas.component.html',
  styleUrls: ['./senhas.component.scss']
})
export class SenhasComponent implements OnInit {
  // Tabela
  senhas: Senha[] = [];

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
    private senhasService: SenhasService,
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
      nome_sistema: ['', Validators.required],
      url: [''],
      usuario_email: [''],
      senha: [''],
      observacoes: [''],
    });
  }

  // ---------- Carregamentos ----------
  loadTableData(): void {
    this.loading = true;
    this.senhasService.list().subscribe({
      next: (data) => {
        this.senhas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar senhas:', err);
        this.loading = false;
      },
    });
  }

  get filteredSenhas(): Senha[] {
    if (!this.searchTerm) {
      return this.senhas;
    }
    const term = this.searchTerm.toLowerCase();
    return this.senhas.filter(
      (s) =>
        s.nome_sistema?.toLowerCase().includes(term) ||
        s.url?.toLowerCase().includes(term) ||
        s.usuario_email?.toLowerCase().includes(term)
    );
  }

  // ---------- Eventos ----------
  onSenhaClicked(senha: Senha): void {
    this.editingId = senha.id!;
    this.senhaForm.patchValue(senha);
    this.showForm = true;
  }

  // ---------- CRUD ----------
  onSubmit(): void {
    if (this.senhaForm.invalid) return;
    const data = this.senhaForm.value;

    if (this.editingId) {
      this.senhasService.update(this.editingId, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTableData();
        },
        error: (err) => console.error('Erro ao atualizar:', err),
      });
    } else {
      this.senhasService.create(data).subscribe({
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
    this.senhasService.delete(id).subscribe({
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
