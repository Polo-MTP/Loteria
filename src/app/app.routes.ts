import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { GuestGuard } from './core/guards/guest.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authenticatedComponent } from './pages/layouts/authenticated/authenticated.component';
import { AuthGuard } from './core/guards/auth.guard';
import { InicioComponent } from './dashboard/inicio/inicio.component';
import { EsperaAnfitrionComponent } from './dashboard/espera-anfitrion/espera-anfitrion.component';
import { AnfitrionComponent } from './dashboard/anfitrion/anfitrion.component';
import { PartidasComponent } from './dashboard/partidas/partidas.component';
import { SalaEsperaComponent } from './dashboard/sala-espera/sala-espera.component';
import { JuegoUsuarioComponent } from './dashboard/juego-usuario/juego-usuario.component';


export const routes: Routes = [

    {
        path: '',
        component: WelcomeComponent,
        canActivate: [GuestGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [GuestGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [GuestGuard]
    },
    {
        path: 'app',
        component: authenticatedComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: InicioComponent
            },
            {
                path: 'espera-anfitrion/:id',
                component: EsperaAnfitrionComponent
            },
            {
                path: 'juego/anfitrion/:id',
                component: AnfitrionComponent
            },
            {
                path: 'partidas',
                component: PartidasComponent
            },
            {
                path: 'sala-espera/:id',
                component: SalaEsperaComponent
            },
            {
                path: 'juego/:id',
                component: JuegoUsuarioComponent
            }
        ]

    }
];
