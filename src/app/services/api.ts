import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Cambia las líneas 10 y 11 para que queden así:
  private readonly PROJECTS_URL = 'http://localhost:3000/projects';
  private readonly AUTH_URL = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // =====================================================
  // 🔐 AUTENTICACIÓN
  // =====================================================

  login(nombre: string, pass: string): Observable<any> {
    return this.http.post(
      `${this.AUTH_URL}/login`,
      { nombre, password: pass },
      { headers: this.getHeaders() }
    ).pipe(
      tap((res: any) => {
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
      })
    );
  }

  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refresh_token');

    return this.http.post(
      `${this.AUTH_URL}/refresh`,
      { refresh_token: token },
      { headers: this.getHeaders() }
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // =====================================================
  // 🏢 EMPRESAS
  // =====================================================

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.PROJECTS_URL}/empresas`,
      { headers: this.getHeaders() }
    );
  }

  registrarEmpresa(nombre: string): Observable<any> {
    return this.http.post(
      `${this.PROJECTS_URL}/registrar-empresa`,
      { nombre: nombre.toUpperCase() },
      { headers: this.getHeaders() }
    );
  }

  // =====================================================
  // 📁 PROYECTOS
  // =====================================================

  // 🔹 Nuevo endpoint general
  getProyectos(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.PROJECTS_URL}/proyectos`,
      { headers: this.getHeaders() }
    );
  }

  // 🔹 COMPATIBILIDAD CON TU FRONTEND ACTUAL
  getProyectosPorEmpresa(idEmpresa: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.PROJECTS_URL}/empresas/${idEmpresa}/proyectos`,
      { headers: this.getHeaders() }
    );
  }

  getProyectoDetalle(idProyecto: number): Observable<any> {
    return this.http.get<any>(
      `${this.PROJECTS_URL}/proyectos/${idProyecto}`,
      { headers: this.getHeaders() }
    );
  }

  crearProyecto(nombre: string, categoria?: string): Observable<any> {
    return this.http.post(
      `${this.PROJECTS_URL}/crear-proyecto`,
      { 
        nombre: nombre.toUpperCase(),
        categoria: categoria
      },
      { headers: this.getHeaders() }
    );
  }
  asignarProyectoAEmpresa(idEmpresa: number, idProyecto: number): Observable<any> {
    return this.http.post(
      `${this.PROJECTS_URL}/empresas/${idEmpresa}/agregar-proyecto/${idProyecto}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Alias para no romper tu componente actual
  reasignarProyecto(idEmpresa: number, idProyecto: number): Observable<any> {
    return this.asignarProyectoAEmpresa(idEmpresa, idProyecto);
  }

  vincularProyectoAEmpresa(idEmpresa: number, idProyecto: number): Observable<any> {
    return this.asignarProyectoAEmpresa(idEmpresa, idProyecto);
  }

  // =====================================================
  // 📊 ETAPAS
  // =====================================================

getEtapas(idProyecto: number, id_empresa: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.PROJECTS_URL}/proyectos/${idProyecto}/etapas?id_empresa=${id_empresa}`,
    { headers: this.getHeaders() }
  );
}
crearEtapa(nombre: string, idProyecto: number): Observable<any> {
  return this.http.post(
    `${this.PROJECTS_URL}/crear-etapa`,
    { 
      nombre: nombre.toUpperCase(),
      id_proyecto: idProyecto 
    },
    { headers: this.getHeaders() }
  );
}
  // =====================================================
  // 📌 TEMAS
  // =====================================================

  getTemas(idEtapa: number, idEmpresa: number, idProyecto: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.PROJECTS_URL}/etapas/${idEtapa}/temas?id_empresa=${idEmpresa}&id_proyecto=${idProyecto}`,
      { headers: this.getHeaders() } // 🌟 Asegúrate de que tenga las llaves { headers: ... }
    );
  }

    crearTema(nombre: string, idProyecto: number, idEtapa: number): Observable<any> {
      return this.http.post(
        `${this.PROJECTS_URL}/crear-tema`,
        {
          nombre: nombre.toUpperCase(), // 🔹 si backend exige mayúscula
          id_proyecto: idProyecto,
          id_etapa: idEtapa
        },
        { headers: this.getHeaders() }
      );
    }

  // 🔹 Método antiguo compatible (temporal)
  getTemasPorProyecto(idEmpresa: number, idProyecto: number): Observable<any[]> {
    return this.getEtapas(idProyecto, idEmpresa);

  }

  agregarEtapa(
    idEmpresa: number,
    idProyecto: number,
    nombreEtapa: string
  ): Observable<any> {
    return this.crearEtapa(nombreEtapa, idProyecto);
  }

  // =====================================================
  // 📎 SUBTEMAS
  // =====================================================

getSubtemas(idTema: number, idEmpresa: number, idProyecto: number): Observable<any[]> {
  const params = new HttpParams()
    .set('id_empresa', idEmpresa.toString())
    .set('id_proyecto', idProyecto.toString());

  return this.http.get<any[]>(
    `${this.PROJECTS_URL}/temas/${idTema}/subtemas?id_empresa=${idEmpresa}&id_proyecto=${idProyecto}`,
    { headers: this.getHeaders()}
  );
}


  crearSubtema(nombre: string, idTema: number): Observable<any> {
    return this.http.post(
      `${this.PROJECTS_URL}/crear-subtema`,
      {
        nombre: nombre.toUpperCase(),
        id_tema: idTema
      },
      { headers: this.getHeaders() }
    );
  }

  // =====================================================
  // 🔄 ESTADOS (GENÉRICO)
  // =====================================================

  actualizarEstado(data: {
    id_empresa: number;
    id_proyecto: number;
    id_etapa?: number;
    id_tema?: number;
    id_subtema?: number;
    estado: string;
  }): Observable<any> {
    return this.http.patch(
      `${this.PROJECTS_URL}/actualizar-estado`,
      {
        ...data,
        estado: data.estado.toLowerCase()
      },
      { headers: this.getHeaders() }
    );
  }

  // 🔹 Alias viejo compatible
  actualizarEstadoTema(
    idEmpresa: number,
    idProyecto: number,
    idTema: number,
    estado: string
  ): Observable<any> {
    return this.actualizarEstado({
      id_empresa: idEmpresa,
      id_proyecto: idProyecto,
      id_tema: idTema,
      estado
    });
  }

  // =====================================================
  // 💾 RESPALDO LOCAL
  // =====================================================

  saveEvaluacion(empresaId: any, etapas: any[], progreso: any): void {
    localStorage.setItem(
      'respaldo_progreso_' + empresaId,
      JSON.stringify({ etapas, progreso })
    );
  }

  
  



}
