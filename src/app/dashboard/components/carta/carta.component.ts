import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css'
})
export class CartaComponent {
  @Input() numeros: number[] = [];
  @Input() fichas: number[] = [];
  @Input() modoSoloLectura = false; // Para el anfitrión que solo observa

  @Output() fichaColocada = new EventEmitter<number>(); // Índice de la posición clickeada

  onclick(posición: number): void {
    if(this.modoSoloLectura) return;

    this.fichaColocada.emit(posición);
  }

  tieneFicha(posición: number): boolean {
    return this.fichas.includes(posición);
  }

  obtenerRuta(id: number): string {
    return `cartas/${id}.jpg`;
  }


}
