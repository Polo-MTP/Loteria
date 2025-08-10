import { Component } from '@angular/core';
import { PartidaService } from '../../core/services/partida.service';
import { OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mis-partidas',
  imports: [CommonModule],
  templateUrl: './mis-partidas.component.html',
  styleUrl: './mis-partidas.component.css'
})
export class MisPartidasComponent {
  partidas: any[] = [];
  loading = false;
  errorMsg = '';
  constructor(private partidaService: PartidaService, private router: Router) {}
  


  ngOnInit(): void {
    this.obtenerPartidas();
  }


  private obtenerPartidas(): void {
    this.loading = true;
    this.errorMsg = '';
    this.partidaService.obtenerMisPartidas().subscribe({
      next: (response) => {
        this.partidas = response.partidas;
        this.loading = false;
        console.log(this.partidas);
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error al obtener mis partidas. Por favor, inténtalo de nuevo.';
      },
    });
  }

  unirsePartida(partidaId: number): void {
    this.router.navigate(['app/juego/' + partidaId]);
  }
}
