import { Component, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// 🔹 Interfaces
interface Subtema {
  id: number;
  nombre: string;
  estado: string;
}

interface Calificacion {
  id_calificacion: number;
  estado: string;
  fecha: string;
}

interface Tema {
  id_tema: number;
  nombre: string;
  estado: string;
  subtemas?: Subtema[];
  calificacion?: Calificacion;
  isFinalizado?: boolean;
  etapa_nombre?: string;
  enlace_drive?: string; // 🔥 NUEVO
}

@Component({
  selector: 'app-temas-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './temas-proyecto.html',
  styleUrls: ['./temas-proyecto.css'],
})
export class TemasProyecto {

  idProyecto!: number;
  idEmpresa!: number;
  idEtapa!: number;

  temas: Tema[] = [];
  nuevoTemaNombre: string = '';

  estados = ['done','pending','none'];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idP = params.get('idProyecto');
      const idE = params.get('idEmpresa');
      const idEt = params.get('idEtapa');

      if (idP && idE && idEt) {
        this.idProyecto = +idP;
        this.idEmpresa = +idE;
        this.idEtapa = +idEt;
        this.cargarTemas();
      }
    });
  }

  // 🔐 Genera clave única por proyecto
  private getStorageKey(): string {
    return `drive_${this.idEmpresa}_${this.idProyecto}_${this.idEtapa}`;
  }

  cargarTemas(callback?: () => void): void {
    this.apiService
      .getTemas(this.idEtapa, this.idEmpresa, this.idProyecto)
      .subscribe({
        next: (data: Tema[]) => {

          this.temas = data.map((tema: Tema) => {
            let isFinalizado = false;

            if (tema.subtemas && tema.subtemas.length > 0) {
              isFinalizado = tema.subtemas.every((st: Subtema) => st.estado === 'done');
            } else if (tema.calificacion && tema.calificacion.estado) {
              isFinalizado = tema.calificacion.estado === 'done';
            }

            if (!tema.estado) tema.estado = 'none';

            return { ...tema, isFinalizado };
          });

          // 🔥 Cargar enlaces guardados
          this.cargarEnlacesDrive();

          this.cd.detectChanges();
          console.log('Temas cargados con estado finalizado:', this.temas);

          if (callback) callback();
        },
        error: (err) => console.error('Error al cargar temas', err)
      });
  }

  // 🔥 Guardar enlace en localStorage
  guardarEnlaceDrive(tema: Tema): void {
    if (!tema.enlace_drive) return;

      // 🔒 Validar que sea enlace de Drive
    if (!tema.enlace_drive.includes('drive.google.com')) {
      alert('Solo se permiten enlaces de Google Drive');
      return;
    }

    const key = this.getStorageKey();
    const data = JSON.parse(localStorage.getItem(key) || '{}');

    data[tema.id_tema] = tema.enlace_drive;

    localStorage.setItem(key, JSON.stringify(data));

    console.log('Enlace guardado correctamente');
  }

  // 🔥 Cargar enlaces guardados
  private cargarEnlacesDrive(): void {
    const key = this.getStorageKey();
    const data = JSON.parse(localStorage.getItem(key) || '{}');

    this.temas = this.temas.map(tema => ({
      ...tema,
      enlace_drive: data[tema.id_tema] || ''
    }));
  }

  eliminarEnlaceDrive(tema: Tema): void {
  const key = this.getStorageKey();
  const data = JSON.parse(localStorage.getItem(key) || '{}');

  delete data[tema.id_tema];

  localStorage.setItem(key, JSON.stringify(data));

  tema.enlace_drive = '';
}


  agregarTema(): void {
    if (!this.nuevoTemaNombre.trim()) return;

    this.apiService
      .crearTema(this.nuevoTemaNombre, this.idProyecto, this.idEtapa)
      .subscribe({
        next: () => {
          this.nuevoTemaNombre = '';
          this.cargarTemas();
        },
        error: (err) => console.error('Error al agregar tema', err)
      });
  }

  cambiarEstado(idTema: number, estado: string): void {
    this.apiService
      .actualizarEstadoTema(this.idEmpresa, this.idProyecto, idTema, estado)
      .subscribe({
        next: () => {
          this.cargarTemas(() => {
            this.guardarProgreso();
          });
        },
        error: (err) => console.error('Error al actualizar estado', err)
      });
  }

  guardarProgreso(): void {
    const progreso = {
      total: this.temas.length,
      realizados: this.temas.filter(t => t.estado === 'done').length
    };

    this.apiService.saveEvaluacion(this.idProyecto, this.temas, progreso);
  }
}
