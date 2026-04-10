import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-subtemas-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subtemas-proyecto.html',
  styleUrls: ['./subtemas-proyecto.css'],
})
export class SubtemasProyecto implements OnInit {

  subtemas: any[] = [];
  nuevoSubtema: string = '';

  idEmpresa: number = 0;
  idProyecto: number = 0;
  idEtapa: number = 0;
  idTema: number = 0;

  // 🔹 Estado del tema padre para reflejar visualmente
  estadoTema: string = 'pending';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Leer snapshot de la ruta
    this.idProyecto = Number(this.route.snapshot.paramMap.get('idProyecto'));
    this.idEmpresa  = Number(this.route.snapshot.paramMap.get('idEmpresa'));
    this.idEtapa    = Number(this.route.snapshot.paramMap.get('idEtapa'));
    this.idTema     = Number(this.route.snapshot.paramMap.get('idTema'));

    if (this.idTema && this.idEmpresa && this.idProyecto) {
      this.cargarSubtemas();
    }
  }

  cargarSubtemas(): void {
    if (!this.idTema || !this.idEmpresa || !this.idProyecto) return;

    this.api.getSubtemas(this.idTema, this.idEmpresa, this.idProyecto)
      .subscribe({
        next: (data: any[]) => {
          this.subtemas = Array.isArray(data) ? [...data] : [];
          this.verificarEstadoTema(); // 🔹 Calcular estado del tema al cargar
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando subtemas', err);
          this.subtemas = [];
        }
      });
  }

  agregarSubtema(): void {
    if (!this.nuevoSubtema.trim()) return;

    this.api.crearSubtema(this.nuevoSubtema, this.idTema)
      .subscribe({
        next: () => {
          this.nuevoSubtema = '';
          this.cargarSubtemas();
        },
        error: (err) => console.error('Error creando subtema', err)
      });
  }

  cambiarEstado(subtema: any, nuevoEstado: string): void {
    const idSubtema = subtema.subtema_id_subtema;

    this.api.actualizarEstado({
      id_empresa: this.idEmpresa,
      id_proyecto: this.idProyecto,
      id_subtema: idSubtema,
      estado: nuevoEstado
    }).subscribe({
      next: () => {
        subtema.estado = nuevoEstado;
        this.verificarEstadoTema(); // 🔹 Actualizar tema automáticamente
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error actualizando estado', err)
    });
  }

  // ======================================================
  // 🔹 VERIFICAR ESTADO DEL TEMA
  // ======================================================
  verificarEstadoTema(): void {
    if (!this.subtemas.length) {
      this.estadoTema = 'pending';
      return;
    }

    const todosDone = this.subtemas.every(s => s.estado === 'done');
    const algunEnProgreso = this.subtemas.some(s => s.estado === 'in-progress');

    this.estadoTema = todosDone ? 'done' : algunEnProgreso ? 'in-progress' : 'pending';

    // Actualizar backend
    this.api.actualizarEstadoTema(
      this.idEmpresa,
      this.idProyecto,
      this.idTema,
      this.estadoTema
    ).subscribe({
      next: () => console.log('Estado del tema actualizado:', this.estadoTema),
      error: (err) => console.error('Error actualizando estado del tema', err)
    });
  }

  volverATemas(): void {
    this.router.navigate([
      '/proyecto',
      this.idProyecto,
      this.idEmpresa,
      'etapa',
      this.idEtapa,
      'temas'
    ]);
  }
}
