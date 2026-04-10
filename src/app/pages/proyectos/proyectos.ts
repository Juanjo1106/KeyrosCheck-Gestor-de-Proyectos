import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css'
})
export class ProyectosComponent implements OnInit {
  empresaId: number = 0;
  nombreEmpresa: string = 'Cargando...';
  proyectos: any[] = [];
  nuevoProyectoNombre: string = '';
  empresas: any[] = []; // 🔥 NECESARIO para el modal


  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,   // 🔥 AGREGA ESTO
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Escuchamos los cambios en la URL para capturar el ID de la empresa
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('idEmpresa');
      this.empresaId = Number(idStr);
      
      console.log("ID de empresa capturado:", this.empresaId);

      if (!isNaN(this.empresaId) && this.empresaId !== 0) {
        this.cargarDatosEmpresa();
        this.cargarProyectos();
        this.cargarEmpresas();
      } else {
        console.error("Error: El ID de la empresa no es un número válido. Recibido:", idStr);
      }
    });
  }

  cargarDatosEmpresa() {
    this.api.getEmpresas().subscribe({
      next: (empresas: any[]) => {
        // Buscamos la empresa probando ambos nombres de propiedad comunes
        const empresa = empresas.find(e => (e.id === this.empresaId || e.id_empresa === this.empresaId));
        if (empresa) {
          this.nombreEmpresa = empresa.nombre || empresa.nombreEmpresa;
        }
      },
      error: (err: any) => console.error("Error al cargar datos de empresa", err)
    });
  }

  cargarEmpresas() {
  this.api.getEmpresas().subscribe({
    next: (data: any[]) => {
      this.empresas = data;
      console.log("Empresas cargadas:", this.empresas);
    },
    error: (err) => console.error("Error cargando empresas", err)
  });
}


cargarProyectos() {
  this.api.getProyectos().subscribe({
    next: (data: any[]) => {

      this.proyectos = data.filter(p =>
        Array.isArray(p.empresas) &&
        p.empresas.some((e: any) =>
          e.id === this.empresaId ||
          e.id_empresa === this.empresaId
        )
      );

      console.log("Proyectos filtrados correctamente:", this.proyectos);

      this.cdr.detectChanges();
    },
    error: (err: any) => console.error("Error al cargar proyectos", err)
  });
}




mostrarOpciones = false;
mostrarModalReasignar = false;

proyectoSeleccionado!: number;
empresaDestino!: number;
nombreProyecto: string = '';
categoriaSeleccionada: string = '';

toggleOpciones() {
  this.mostrarOpciones = !this.mostrarOpciones;
}

abrirModalReasignar(idProyecto?: number) {
  if (idProyecto) {
    this.proyectoSeleccionado = idProyecto;
  }

  this.empresaDestino = undefined as any; // 👈 limpia selección
  this.mostrarModalReasignar = true;
}


cerrarModalReasignar() {
  this.mostrarModalReasignar = false;
  this.proyectoSeleccionado = undefined as any;
}

    confirmarReasignacion() {

      if (!this.empresaDestino || !this.proyectoSeleccionado) {
        alert("Debes seleccionar empresa y proyecto");
        return;
      }

      this.api
        .asignarProyectoAEmpresa(this.empresaDestino, this.proyectoSeleccionado)
        .subscribe({
          next: () => {
            this.cerrarModalReasignar();
            this.cargarProyectos();
          },
          error: (err) => {
            console.error('Error al reasignar proyecto', err);
          }
        });
    }



crearProyecto(): void {

  if (!this.nombreProyecto.trim()) {
    alert('Debe ingresar el nombre del proyecto');
    return;
  }

  if (!this.categoriaSeleccionada) {
    alert('Debe seleccionar una categoría');
    return;
  }

  this.api.crearProyecto(
    this.nombreProyecto,
    this.categoriaSeleccionada
  ).subscribe({
    next: (response: any) => {

      const proyectoId = response.id_proyecto;

      console.log('Proyecto creado:', proyectoId);  

      // 🔥 PASO 2: asignarlo a la empresa
      this.api.asignarProyectoAEmpresa(
        this.empresaId,
        proyectoId
      ).subscribe({
        next: () => {

          console.log('Proyecto asignado a empresa');

          // 🔥 PASO 3: ahora sí navegar
          this.router.navigate([
            '/proyecto',
            proyectoId,
            this.empresaId,
            'etapas'
          ]);

        },
        error: (err: any) => {
          console.error('Error al asignar proyecto', err);
        }
      });

    },
    error: (err: any) => {
      console.error('Error al crear proyecto', err);
      alert('Error al crear el proyecto');
    }
  });
}
}

