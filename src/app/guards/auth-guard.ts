import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    return true; // Si hay token, da luz verde para entrar a las empresas
  } else {
    return false; // Si NO hay token, simplemente bloquea el paso (mantiene la pantalla en la raíz con tu login)
  }
};