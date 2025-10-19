import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ⭐ ADICIONAR
import { FeaturesRoutingModule } from './features-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DespesasComponent } from './despesas/despesas.component';
import { GraficosComponent } from './graficos/graficos.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { ReceitasComponent } from './receitas/receitas.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DespesasComponent,
    GraficosComponent,
    ProdutosComponent,
    ReceitasComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    FormsModule,              // ⭐ ADICIONAR
    ReactiveFormsModule,
    SharedModule      // ⭐ ADICIONAR
  ]
})
export class FeaturesModule {}
