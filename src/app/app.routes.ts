import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Agenda } from './pages/agenda/agenda';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },  // redireciona raiz para login
    { path: 'login', component: Login },
    { path: 'agenda', component: Agenda },
    { path: '**', redirectTo: 'login' }  // fallback para login
];
