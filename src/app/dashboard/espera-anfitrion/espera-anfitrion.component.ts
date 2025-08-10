import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap,takeWhile } from 'rxjs/operators';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { Partida } from '../../core/types/partida';

interface FlashMessage {
  success?: string;
}



@Component({
  selector: 'app-espera-anfitrion',
  imports: [CommonModule],
  templateUrl: './espera-anfitrion.component.html',
  styleUrl: './espera-anfitrion.component.css'
})
export class EsperaAnfitrionComponent implements OnInit, OnDestroy {
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

  get statusMessage(): string {
    if (this.jugadoresActuales >= 2) {
      return '¡Jugador encontrado! Iniciando partida...';
    }
    return 'Esperando que otro jugador se una a la partida...';
  }

  get progressPercentage(): number {
    return (this.jugadoresActuales / this.maxJugadores) * 100;
  }

  private cargarPartida(): void {
    this.partidaService.obtenerPartida(this.partidaId).subscribe({
      next: (response) => {
        this.partida = response.partida;
        this.maxJugadores = response.partida.maxJugadores;
        this.loading = false;
        this.iniciarPolling();
      },
      error: (error) => {
        console.error('Error al cargar la partida:', error);
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
            console.log('Estado actual:', estado);

            this.redirectTimeout = window.setTimeout(() => {
              this.router.navigate(['app/juego/anfitrion', this.partidaId]).then(() => {
                this.isRedirecting = false;
              });
            }, 2000);
          }
          console.log('Estado actual:', estado);
        },
        error: (error) => {
          console.error('Error al verificar estado:', error);
        },
      });
  }

  // cancelar(): void {
  //   if (this.isRedirecting) return;

  //   this.polling = false;
  //   this.isRedirecting = true;

  //   if (this.redirectTimeout) {
  //     clearTimeout(this.redirectTimeout);
  //   }
  //   if (this.pollingSubscription) {
  //     this.pollingSubscription.unsubscribe();
  //   }

  //   this.partidaService.cancelarPartida(this.partidaId).subscribe({
  //     next: () => {
  //       this.isRedirecting = false;
  //       this.router.navigate(['/']);
  //     },
  //     error: (error) => {
  //       console.error('Error al cancelar partida:', error);
  //       this.isRedirecting = false;
  //     },
  //   });
  // }
}
