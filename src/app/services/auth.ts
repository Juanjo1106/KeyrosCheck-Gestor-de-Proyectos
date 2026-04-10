import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = 'https://factional-aja-gangly.ngrok-free.dev/auth';

  private readonly headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // Método para el Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/login`, { email, password }, { headers: this.headers }).pipe(
      tap((res: any) => {
        // Guardamos los tokens en el navegador
        let respuestaToken = res.access_token || res.token; // Por si tu backend devuelve 'token' en
        console.log("Token obtenido:", respuestaToken);
        if (respuestaToken.access_token) {
          localStorage.setItem('access_token', respuestaToken.access_token);

        }
        if (res.refresh_token) {
          localStorage.setItem('refresh_token', res.refresh_token);
        }
      })
    );
  }

  // Método para renovar el token automáticamente
  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refresh_token');
    return this.http.post(`${this.AUTH_URL}/refresh`, { refresh_token: token }, { headers: this.headers });
  }

  // Cerrar sesión
  logout() {
    localStorage.clear();
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}