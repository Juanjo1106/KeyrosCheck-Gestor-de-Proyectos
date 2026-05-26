import { Routes } from '@angular/router';
import { EmpresasComponent } from './pages/empresas/empresas';
import { ProyectosComponent } from './pages/proyectos/proyectos';
import { EtapasComponent } from './pages/etapas/etapas';
import { TemasProyecto } from './pages/temas-proyecto/temas-proyecto';

export const routes: Routes = [
  // Dejamos la ruta raíz vacía para que cargue el AppComponent solo, sin redirigir de inmediato
  { path: '', component: EmpresasComponent }, // O puedes quitar esta línea si manejas el renderizado con ngIf en app.html
  
  { path: 'empresas', component: EmpresasComponent },
  { path: 'empresa/:idEmpresa/proyectos', component: ProyectosComponent },
  { path: 'proyecto/:idProyecto/:idEmpresa/etapas', component: EtapasComponent },
  { path: 'proyecto/:idProyecto/:idEmpresa/etapa/:idEtapa/temas', component: TemasProyecto },
  { 
    path: 'proyecto/:idProyecto/:idEmpresa/etapa/:idEtapa/tema/:idTema/subtemas',
    loadComponent: () =>
      import('./pages/subtemas-proyecto/subtemas-proyecto')
        .then(m => m.SubtemasProyecto)
  },
  { path: '**', redirectTo: 'empresas' }
];