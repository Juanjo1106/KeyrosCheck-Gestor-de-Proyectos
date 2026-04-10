import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router'; 
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  nombre: string = ''; 
  pass: string = '';
  loading: boolean = false;
  isLoggedIn: boolean = false;
  

  constructor(
    private api: ApiService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Verificación inicial sólida
    this.checkAuth();
  }

  ngOnInit() {
    if (this.isLoggedIn) {
      this.router.navigate(['/empresas']);
    }
  }

  private checkAuth() {
    const token = localStorage.getItem('access_token');
    this.isLoggedIn = !!token;
  }

  onLogin() {
    const nombreLimpio = this.nombre.trim();
    const passLimpia = this.pass.trim();

    if (!nombreLimpio || !passLimpia) {
      alert("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    this.loading = true;

    this.api.login(nombreLimpio, passLimpia).subscribe({
      next: (res) => {
  console.log("Respuesta del servidor:", res);

  // Verificamos que venga el objeto access_token
  if (res.access_token) {
    const accessToken = res.access_token.access_token;
    const refreshToken = res.access_token.refresh_token;

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }

    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }


        // 2. SINCRONIZACIÓN DE ESTADO
        // Esperamos un ciclo de reloj para asegurar que el Storage escribió el dato
        setTimeout(() => {
          this.isLoggedIn = true;
          this.loading = false;
          this.cdr.detectChanges(); 

          // 3. NAVEGACIÓN
          this.router.navigate(['/empresas']).then((navOk) => {
            if (!navOk) {
              console.error("Fallo en la navegación. Revisa tus rutas.");
            }
          });
        }, 50);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.error("Error en login:", err);
        // Mensaje más descriptivo para depurar
        const msg = err.status === 401 ? "Credenciales inválidas" : "Error de servidor";
        alert(msg);
      }
    });
  }

  logout() {
    this.api.logout();
    this.isLoggedIn = false;
    this.nombre = '';
    this.pass = '';
    this.cdr.detectChanges();
    this.router.navigate(['/']);
  }
}