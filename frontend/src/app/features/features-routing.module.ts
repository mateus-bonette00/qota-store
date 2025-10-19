import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DespesasComponent } from './despesas/despesas.component';
import { GraficosComponent } from './graficos/graficos.component';
import { ProdutosComponent } from './produtos/produtos.component';
import { ReceitasComponent } from './receitas/receitas.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'despesas',  component: DespesasComponent },
  { path: 'graficos',  component: GraficosComponent },
  { path: 'produtos',  component: ProdutosComponent },
  { path: 'receitas',  component: ReceitasComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
