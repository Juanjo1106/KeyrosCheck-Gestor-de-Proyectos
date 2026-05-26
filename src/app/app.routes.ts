import { Routes } from '@angular/router';
import { EmpresasComponent } from './pages/empresas/empresas';
import { ProyectosComponent } from './pages/proyectos/proyectos';
import { EtapasComponent } from './pages/etapas/etapas';
import { TemasProyecto } from './pages/temas-proyecto/temas-proyecto';
// Cambia esto en la línea 6 de tu app.routes.ts
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  // 1. Quita el component de la raíz. Deja que redirija a empresas, pero el Guard lo va a frenar
  { path: '', redirectTo: 'empresas', pathMatch: 'full' }, 
  
  // 2. Protege todas tus rutas internas con el guardián
  { path: 'empresas', component: EmpresasComponent, canActivate: [authGuard] },
  { path: 'empresa/:idEmpresa/proyectos', component: ProyectosComponent, canActivate: [authGuard] },
  { path: 'proyecto/:idProyecto/:idEmpresa/etapas', component: EtapasComponent, canActivate: [authGuard] },
  { path: 'proyecto/:idProyecto/:idEmpresa/etapa/:idEtapa/temas', component: TemasProyecto, canActivate: [authGuard] },
  { 
    path: 'proyecto/:idProyecto/:idEmpresa/etapa/:idEtapa/tema/:idTema/subtemas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/subtemas-proyecto/subtemas-proyecto')
        .then(m => m.SubtemasProyecto)
  },
  
  { path: '**', redirectTo: 'empresas' }
];