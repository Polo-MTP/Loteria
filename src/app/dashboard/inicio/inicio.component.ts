import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PartidaService } from '../../core/services/partida.service';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {
  showModal = false;
  createGameForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private partidaService: PartidaService
  ) {
    this.createGameForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      max_jugadores: ['', [Validators.required, Validators.min(2)]],
    });
  }

  openModal(): void {
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.createGameForm.reset();
    this.isLoading = false;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.createGameForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.createGameForm.value;

      this.partidaService.crearPartida(formData).subscribe({
        next: (response) => {
          if (response && response.partida.id && !isNaN(response.partida.id)) {
            this.router.navigate(['/app/espera-anfitrion/' + response.partida.id]);
            this.closeModal();
          } else {
            this.errorMessage =
              'Error: La partida se creó pero no tiene un ID válido.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error al crear la partida:', err);
          this.isLoading = false;

          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage =
              'Error al crear la partida. Por favor, inténtalo de nuevo.';
          }
        },
      });
    } else {
      console.warn('Formulario inválido o ya está enviando');
      if (this.createGameForm.invalid) {
        Object.keys(this.createGameForm.controls).forEach((key) => {
          this.createGameForm.get(key)?.markAsTouched();
        });
      }
    }
  }

  navigateToPartidas(): void {
    this.router.navigate(['app/partidas']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createGameForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.createGameForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `El campo ${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}
