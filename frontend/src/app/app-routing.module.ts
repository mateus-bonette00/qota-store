import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReceitasComponent } from './features/receitas/receitas.component';
import { DespesasComponent } from './features/despesas/despesas.component';
import { ProdutosComponent } from './features/produtos/produtos.component';
import { GraficosComponent } from './features/graficos/graficos.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'receitas', component: ReceitasComponent },
  { path: 'despesas', component: DespesasComponent },
  { path: 'produtos', component: ProdutosComponent },
  { path: 'graficos', component: GraficosComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
