import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-etapas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './etapas.html',
  styleUrl: './etapas.css'
})
export class EtapasComponent implements OnInit {

  proyectoId: number = 0;
  empresaId: number = 0;

  etapas: any[] = [];
  nuevaEtapaNombre: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.proyectoId = Number(params.get('idProyecto'));
      this.empresaId = Number(params.get('idEmpresa'));

      console.log("Proyecto ID:", this.proyectoId);

      if (this.proyectoId) {
        this.cargarEtapas();
      }
    });
  }

  cargarEtapas() {
    this.api.getEtapas(this.proyectoId, this.empresaId).subscribe({
      next: (data: any[]) => {
        console.log("Etapas backend:", data);
        this.etapas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error cargando etapas", err)
    });
  }

  crearEtapa() {
    const nombre = this.nuevaEtapaNombre.trim();
    if (!nombre) return;

    this.api.crearEtapa(nombre, this.proyectoId).subscribe({
      next: () => {
        this.nuevaEtapaNombre = '';
        this.cargarEtapas();
      },
      error: (err) => console.error("Error creando etapa", err)
    });
  }
}
