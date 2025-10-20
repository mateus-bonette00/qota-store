import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyInfoService } from '../../core/services/company-info.service';
import { CompanyInfo } from '../../core/models/company-info.model';

@Component({
  selector: 'app-informacoes-empresa',
  templateUrl: './informacoes-empresa.component.html',
  styleUrls: ['./informacoes-empresa.component.scss']
})
export class InformacoesEmpresaComponent implements OnInit {
  infoForm: FormGroup;
  loading = false;
  editing = false;

  constructor(
    private companyInfoService: CompanyInfoService,
    private fb: FormBuilder
  ) {
    this.infoForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInfo();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nome_empresa: ['', Validators.required],
      ein: [''],
      endereco: [''],
      telefone: [''],
      email_corporativo: ['', Validators.email],
      nome_daniel: [''],
      endereco_envio_prep: [''],
      nome_cartao_mercury: [''],
      numero_cartao_mercury: [''],
      data_vencimento_cartao: [''],
      cvc_cartao: [''],
    });
  }

  loadInfo(): void {
    this.loading = true;
    this.companyInfoService.get().subscribe({
      next: (data) => {
        if (data) {
          this.infoForm.patchValue(data);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar informações:', err);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.infoForm.invalid) return;

    this.loading = true;
    this.companyInfoService.createOrUpdate(this.infoForm.value).subscribe({
      next: () => {
        alert('Informações atualizadas com sucesso!');
        this.editing = false;
        this.loadInfo();
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert('Erro ao salvar informações');
        this.loading = false;
      },
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    if (!this.editing) {
      this.loadInfo();
    }
  }

  copyToClipboard(text: string, field: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert(`${field} copiado para a área de transferência!`);
    });
  }
}
