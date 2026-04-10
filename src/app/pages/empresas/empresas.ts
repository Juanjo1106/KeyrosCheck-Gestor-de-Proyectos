import { Component, OnInit,   ChangeDetectorRef} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api';



@Component({

  selector: 'app-empresas',

  standalone: true,

  imports: [

    CommonModule,

    RouterLink,

    FormsModule

  ],

  templateUrl: './empresas.html',

  styleUrl: './empresas.css'

})

export class EmpresasComponent implements OnInit {

  empresas: any[] = [];

  nuevaEmpresaNombre: string = ''; // Esta es para CREAR

  filtroBusqueda: string = '';      // ESTA ES LA QUE FALTABA (para BUSCAR)

  loading: boolean = false;

  empresasFiltradas: any[] = [];

  constructor(private api: ApiService, private router: Router,    private cd: ChangeDetectorRef) {}



  ngOnInit() {

    this.cargarEmpresas();
   
  }

    cargarEmpresas() {

        //this.loading = true;

        this.api.getEmpresas().subscribe({

          next: (data) => {
            
            this.empresas = Array.isArray(data) ? data : [];
            this.aplicarFiltro();
            console.log("Empresasfil cargadas:", this.empresasFiltradas);

          //  this.loading = false;
            this.cd.detectChanges();
          },

          error: (err) => {

            console.error("Error cargando empresas:", err);

            //this.loading = false;


            // --- CAMBIO AQUÍ ---

            if (err.status === 401) {

              console.warn("Sesión no autorizada. Verificando token...");

              const token = localStorage.getItem('access_token');

              console.log("Token actual:", token);

             

              if (!token) {

                // Si realmente NO hay token, entonces sí salimos

                this.api.logout();

                this.router.navigate(['/']);

              } else {

                // Si HAY token pero dio 401, puede ser un error momentáneo.

                // NO cerramos sesión, solo informamos o redirigimos.

                console.error("El token existe pero el servidor lo rechazó.");

                // Opcional: podrías intentar re-loguear o simplemente mandar al login

                // SIN borrar el token para ver si al reintentar funciona.

                this.router.navigate(['/']);

              }

            }

          }

        });

      }


    aplicarFiltro(): void {
      if (!Array.isArray(this.empresas)) {
        this.empresasFiltradas = [];
        return;
      }

      const busqueda = this.filtroBusqueda.toLowerCase().trim();

      if (!busqueda) {
        this.empresasFiltradas = [...this.empresas];
        return;
      }

      this.empresasFiltradas = this.empresas.filter(e => {
        const nombre = (e.nombreEmpresa || e.nombre || '').toLowerCase();
        return nombre.includes(busqueda);
      });
    }



  // Ahora el filtro usa 'filtroBusqueda' en lugar de 'nuevaEmpresaNombre'

  /*empresasFiltradas() {

    if (!Array.isArray(this.empresas)) return [];

   

    const busqueda = this.filtroBusqueda.toLowerCase().trim();

   

    if (!busqueda) return this.empresas;



    return this.empresas.filter(e => {

      // Verificamos ambos posibles campos del backend

      const nombre = (e.nombreEmpresa || e.nombre || '').toLowerCase();

      return nombre.includes(busqueda);

    });

  }

*/

  crearEmpresa() {

    const nombre = this.nuevaEmpresaNombre.trim();

    if (!nombre) return;



    //this.loading = true;

    this.api.registrarEmpresa(nombre).subscribe({

      next: (res) => {

        console.log("Empresa creada:", res);

        this.nuevaEmpresaNombre = ''; // Limpiamos el input de creación

        this.cargarEmpresas(); // Recargamos la lista

      },

      error: (err) => {

      //  this.loading = false;

        console.error("Error al registrar:", err);

        alert("No se pudo crear. Verifica si tu sesión expiró (Error 401).");

      }

    });

  }

}