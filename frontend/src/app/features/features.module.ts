import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeaturesRoutingModule } from './features-routing.module';
import { NgChartsModule } from 'ng2-charts';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DespesasComponent } from './despesas/despesas.component';
import { GraficosComponent } from './graficos/graficos.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { SharedModule } from '../shared/shared.module';
import { SenhasComponent } from './senhas/senhas.component';
import { SenhasFornecedoresComponent } from './senhas-fornecedores/senhas-fornecedores.component';
import { InformacoesEmpresaComponent } from './informacoes-empresa/informacoes-empresa.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DespesasComponent,
    GraficosComponent,
    ProdutosComponent,
    ReceitasComponent,
    SenhasComponent,
    SenhasFornecedoresComponent,
    InformacoesEmpresaComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    SharedModule
  ]
})
export class FeaturesModule {}
