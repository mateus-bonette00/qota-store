import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  navItems = [
    { route: '/dashboard', label: 'Principal', icon: 'home' },
    { route: '/receitas', label: 'Receitas', icon: 'dollar-sign' },
    { route: '/graficos', label: 'Gráficos', icon: 'trending-up' },
    { route: '/despesas', label: 'Despesas', icon: 'credit-card' },
    { route: '/produtos', label: 'Produtos', icon: 'package' },
    { route: '/senhas', label: 'Senhas', icon: 'lock' },
    { route: '/senhas-fornecedores', label: 'Senhas Fornec.', icon: 'key' },
    { route: '/informacoes-empresa', label: 'Info Empresa', icon: 'building-2' }
  ];
}
