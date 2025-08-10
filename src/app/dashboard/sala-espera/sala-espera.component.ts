import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { Partida } from '../../core/types/partida';

interface FlashMessage {
  success?: string;
}

@Component({
  selector: 'app-sala-espera',
  imports: [CommonModule],
  templateUrl: './sala-espera.component.html',
  styleUrl: './sala-espera.component.css',
})
export class SalaEsperaComponent implements OnInit, OnDestroy {
  partida!: Partida;
  flash: FlashMessage = {};
  jugadoresActuales: number = 0;
  maxJugadores: number = 0;
  polling: boolean = true;
  isRedirecting: boolean = false;
  loading: boolean = true;

  private pollingSubscription?: Subscription;
  private redirectTimeout?: number;
  private partidaId!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partidaService: PartidaService
  ) {}


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.partidaId = +params['id'];
      this.cargarPartida();
    });
  }

  ngOnDestroy(): void {
    this.polling = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }


  private cargarPartida(): void {
    this.partidaService.obtenerPartidaJugador(this.partidaId).subscribe({
      next: (response) => {
        this.partida = response.partida;
        this.maxJugadores = response.partida.maxJugadores;
        this.loading = false;
        this.iniciarPolling();
      },
      error: (error) => {
        this.router.navigate(['/']);
      },
    });
  }

  private iniciarPolling(): void {
    this.pollingSubscription = interval(2000)
      .pipe(
        takeWhile(() => this.polling && !this.isRedirecting),
        switchMap(() => this.partidaService.verificarEstado(this.partidaId))
      )
      .subscribe({
        next: (response) => {
          const estado = response.estado;

          this.jugadoresActuales = response.jugadores_actuales;

          if (response.max_jugadores === this.jugadoresActuales) {
            this.polling = false;
            this.isRedirecting = true;
            this.redirectTimeout = window.setTimeout(() => {
              this.router.navigate(['app/juego/', this.partidaId]).then(() => {
                this.isRedirecting = false;
              });
            }, 2000);
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  get statusMessage(): string {
    if (this.jugadoresActuales >= 2) {
      return '¡Jugador encontrado! Iniciando partida...';
    }
    return 'Esperando que otro jugador se una a la partida...';
  }

  get progressPercentage(): number {
    return (this.jugadoresActuales / this.maxJugadores) * 100;
  }
}
