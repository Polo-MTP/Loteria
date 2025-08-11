import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { CartaComponent } from '../components/carta/carta.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-juego-usuario',
  imports: [CommonModule, CartaComponent],
  templateUrl: './juego-usuario.component.html',
  styleUrl: './juego-usuario.component.css',
})
export class JuegoUsuarioComponent implements OnInit, OnDestroy {

  pollingSubscription!: Subscription;
  ultimaCarta: number | null = null;

  partidaId!: number;
  carta: number[] = [];
  posicionesMarcadas: number[] = [];
  maxFichas: number = 16;
  esGanador: boolean = false;
  mensajeResultado: string = '';
  jugadorEliminado: boolean = false;
  cartasNoGritadas: number[] = [];
  puedeJugar: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partidaService: PartidaService
  ) {}

  ngOnInit(): void {
    const partidaId = this.route.snapshot.params['id'];
    this.partidaId = +partidaId;
    this.cargarCarta();
    this.iniciarPolling();
  }


  iniciarPolling(): void {
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.partidaService.sincronizarJugador(this.partidaId).subscribe({
        next: (response) => {
          if (response.success) {
            this.ultimaCarta = response.partida.cartaActual;
            
            // Actualizar fichas del jugador
            this.posicionesMarcadas = response.jugador.fichas || [];
            
            // Verificar estado del jugador
            const estadoJugador = response.jugador.estado || 'jugando';
            
            if (estadoJugador === 'eliminado') {
              this.jugadorEliminado = true;
              this.puedeJugar = false;
              this.mensajeResultado = 'Perdiste - Esperando a los demás jugadores';
            } else if (estadoJugador === 'ganador') {
              this.esGanador = true;
              this.puedeJugar = false;
              this.mensajeResultado = '¡Felicidades! ¡Has ganado la partida!';
            }
            
            // Verificar si la partida terminó
            if (response.partida.estado === 'finalizado') {
              if (this.pollingSubscription) {
                this.pollingSubscription.unsubscribe();
              }
              
              if (!this.mensajeResultado) {
                this.mensajeResultado = 'La partida ha terminado';
              }
              
              // Mostrar resultado y navegar al home
              setTimeout(() => {
                alert(this.mensajeResultado);
                this.router.navigate(['/app/home']);
              }, 3000);
            }
          }
        },
        error: (error) => {
          console.error('Error al sincronizar datos:', error);
          // Fallback al método anterior si la sincronización falla
          this.partidaService.obtenerUltimosDatos(this.partidaId).subscribe({
            next: (response) => {
              this.ultimaCarta = response.ultimaCarta;
              
              if(response.yaHayGanador) {
                this.esGanador = response.tuEresElGanador;
                this.mensajeResultado = this.esGanador ? '¡Felicidades! ¡Has ganado!' : 'Te equivocaste en algunas posiciones!';
                
                if (this.pollingSubscription) {
                  this.pollingSubscription.unsubscribe();
                }
                
                if(!this.esGanador){
                  setTimeout(() => {
                    alert(this.mensajeResultado)
                    this.router.navigate(['/app/home'])
                  }, 3000)
                }
              }
            },
            error: (error) => {
              console.error('Error al obtener ultimos datos:', error);
            },
          });
        },
      });
    });
  }

  obtenerUserId(): number {
    // Esta función debería obtener el ID del usuario actual
    // Por ahora retornamos 0, pero debería implementarse correctamente
    return 0;
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }




  cargarCarta(): void {
    this.partidaService.cargarCarta(this.partidaId, this.carta).subscribe({
      next: (response) => {
        this.carta = response.cartas;
        this.posicionesMarcadas = response.posiciones;
      },
      error: (error) => {
        console.error('Error al cargar la carta:', error);
      },
    });
  }

  colocarFicha(posicion: number): void {
    if (!this.puedeJugar) {
      alert('Ya fuiste eliminado de esta partida');
      return;
    }

    if (this.posicionesMarcadas.includes(posicion)) return;

    if (this.posicionesMarcadas.length >= this.maxFichas) return;

    this.partidaService.colocarFicha(this.partidaId, posicion).subscribe({
      next: (response) => {
        this.posicionesMarcadas = response.fichas; // Usar la respuesta del servidor
      },
      error: (error) => {
        console.error('Error al colocar ficha:', error);
        if (error.error && error.error.message === 'Ya fuiste eliminado de esta partida y no puedes colocar más fichas') {
          this.jugadorEliminado = true;
          this.puedeJugar = false;
          this.mensajeResultado = 'Perdiste - Esperando a los demás jugadores';
        } else {
          alert(error.error?.message || 'Error al colocar ficha');
        }
      },
    });
  }

  validarCarta(): void {
    this.partidaService.validarCarta(this.partidaId).subscribe({
      next: (response) => {
        if (response.ganador) {
          this.esGanador = true;
          this.mensajeResultado = '¡Felicidades! ¡Has ganado!';
          console.log('¡Ganador!');
        } else {
          this.esGanador = false;
          this.mensajeResultado = 'No hay línea ganadora. ¡Intenta de nuevo!';
        }
      },
      error: (error) => {
        console.error('Error al validar carta:', error);
        this.mensajeResultado = 'Error al validar la carta';
      },
    });
  }

  abandonarPartida(): void {
    this.partidaService.salirPartida(this.partidaId).subscribe({
      next: (response) => {
        this.router.navigate(['/app/home'])
      },
      error: (error) => {
        console.error('Error al abandonar la partida:', error);
      },
    });
  }

  estaMarcada(posicion: number): boolean {
    return this.posicionesMarcadas.includes(posicion);
  }

  get fichasRestantes(): number {
    return this.maxFichas - this.posicionesMarcadas.length;
  }

  get ArregloFichasRestantes(): number[] {
    return Array(this.fichasRestantes).fill(0)
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'cartas/default.png';
    }
  }

  get puedeCrearLoteria(): boolean {
    return this.posicionesMarcadas.length === 16 && this.puedeJugar && !this.esGanador;
  }

  cantarLoteria(): void {
    if (!this.puedeCrearLoteria) {
      alert('Debes tener las 16 fichas colocadas para cantar lotería');
      return;
    }

    if (confirm('¿Estás seguro de que quieres cantar LOTERÍA? Si no tienes todas las cartas correctas, serás eliminado.')) {
      this.partidaService.cantarLoteria(this.partidaId).subscribe({
        next: (response) => {
          if (response.ganador) {
            this.esGanador = true;
            this.mensajeResultado = response.message || '¡LOTERÍA! ¡Has ganado!';
            this.puedeJugar = false;
            
            // Detener polling
            if (this.pollingSubscription) {
              this.pollingSubscription.unsubscribe();
            }
            
            setTimeout(() => {
              alert(this.mensajeResultado);
              this.router.navigate(['/app/home']);
            }, 2000);
            
          } else if (response.eliminado) {
            this.jugadorEliminado = true;
            this.puedeJugar = false;
            this.mensajeResultado = response.message || 'Perdiste - Esperando a los demás jugadores';
            this.cartasNoGritadas = response.cartasNoGritadas || [];
          }
        },
        error: (error) => {
          console.error('Error al cantar lotería:', error);
          alert(error.error?.message || 'Error al cantar lotería');
        },
      });
    }
  }
}
