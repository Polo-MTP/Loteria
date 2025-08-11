import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { PartidaService } from '../../core/services/partida.service';
import { CommonModule } from '@angular/common';
import { CartaComponent } from '../components/carta/carta.component';

@Component({
  selector: 'app-anfitrion',
  standalone: true,
  imports: [CommonModule, CartaComponent],
  templateUrl: './anfitrion.component.html',
  styleUrl: './anfitrion.component.css',
})
export class AnfitrionComponent implements OnInit, OnDestroy {
  partidaId: number = 0;
  partida: any;
  mazoRestante: number[] = [];
  cartasGritadas: number[] = [];
  cartaActual: number = 0;
  isLoading: boolean = false;
  errorMsg = '';

  pollingSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partidaService: PartidaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(+id)) {
      this.router.navigate(['/']);
      return;
    }
    this.partidaId = +id;
    this.cargarPartida();

    this.pollingSubscription = interval(5000).subscribe(() => {
      this.cargarPartida(false);
    });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  cargarPartida(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading = true;
    }

    this.partidaService.obtenerJuegoAnfitrion(this.partidaId).subscribe({
      next: (response) => {
        this.partida = {
          ...response.partida,
          usuarios: response.partida.usuarios?.map((usuario: any) => ({
            ...usuario,
            cartas: this.parseJSONSafely(usuario.cartas, []),
            fichas: this.parseJSONSafely(usuario.fichas, [])
          })) || []
        };
        
        this.cartasGritadas = response.partida.cartasGritadas || [];
        this.cartaActual = response.partida.cartaActual ?? 0;

        this.mazoRestante = this.generarMazoRestante();
        this.isLoading = false;
        this.errorMsg = '';
        
        // Verificar si la partida terminó
        if (this.partida.estado === 'finalizado') {
          if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
          }
          
          setTimeout(() => {
            if (this.partida.ganadorId) {
              alert('¡Alguien ganó la partida! La partida ha terminado.');
            } else {
              alert('La partida ha terminado.');
            }
            this.router.navigate(['/app/home']);
          }, 2000);
        }
        
        // Verificar si se acabaron las cartas sin ganador
        if (this.mazoRestante.length === 0 && this.partida.estado === 'en_curso') {
          this.finalizarPartidaSinGanador();
        }
      },
      error: (error) => {
        this.errorMsg = 'Error cargando la partida';
        this.isLoading = false;
      },
    });
  }

  private parseJSONSafely(jsonString: any, defaultValue: any = null): any {
    if (!jsonString) return defaultValue;
    
    if (typeof jsonString === 'object') return jsonString;
    
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('Error parsing JSON:', jsonString, error);
        return defaultValue;
      }
    }
    
    return defaultValue;
  }

  generarMazoRestante(): number[] {
    const todasCartas = Array.from({ length: 54 }, (_, i) => i + 1);
    return todasCartas.filter(carta => !this.cartasGritadas.includes(carta));
  }

  sacarCarta() {
    if (!this.partida) return;

    if (this.mazoRestante.length === 0) {
      alert('No quedan cartas en el mazo');
      return;
    }

    this.partidaService.gritarCarta(this.partidaId).subscribe({
      next: (response) => {
        this.cartasGritadas.push(response.carta);
        this.cartaActual = response.carta;
        this.mazoRestante = this.generarMazoRestante();
      },
      error: (error) => {
        console.error('Error al gritar carta:', error);
      },
    });
  }

  onImageError(event: Event) {
    console.log('Error cargando imagen para carta:', this.cartaActual);
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'cartas/default.png';
    }
  }

  trackByUsuarioId(index: number, usuario: any): any {
    return usuario.id || index;
  }

  finalizarPartidaSinGanador(): void {
    // Llamar al backend para finalizar la partida sin ganador
    this.partidaService.finalizarPartidaSinGanador(this.partidaId).subscribe({
      next: (response) => {
        if (this.pollingSubscription) {
          this.pollingSubscription.unsubscribe();
        }
        
        setTimeout(() => {
          alert('Se acabaron las cartas sin ganador. Todos pierden.');
          this.router.navigate(['/app/home']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al finalizar partida:', error);
      }
    });
  }
}
