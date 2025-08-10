import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PartidaService } from '../../core/services/partida.service';
import { PartidaAnfitrion } from '../../core/types/partida';
import { OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-partidas',
  imports: [CommonModule],
  templateUrl: './partidas.component.html',
  styleUrl: './partidas.component.css'
})
export class PartidasComponent implements OnInit {
  partidas: PartidaAnfitrion[] = [];
  loading = false;
  errorMsg = '';
  constructor(private partidaService: PartidaService, public router: Router) {}
  


  ngOnInit(): void {
    this.obtenerPartidas();
  }


  private obtenerPartidas(): void {
    this.loading = true;
    this.errorMsg = '';
    this.partidaService.obtenerPartidas().subscribe({
      next: (response) => {
        this.partidas = response.partidas;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error al obtener lista de partidas. Por favor, inténtalo de nuevo.';
      },
    });
  }


  unirsePartida(partidaId: number): void {
    this.partidaService.unirsePartida(partidaId).subscribe({
      next: (response) => {
        this.router.navigate(['app/sala-espera/' + response.partida.id]);
      },
      error: (error) => {
        this.errorMsg = 'Error al unirse a la partida. Por favor, inténtalo de nuevo.';
      },
    });
  }
}
