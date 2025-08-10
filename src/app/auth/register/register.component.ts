import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: [''],
      email: [''],
      password: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.fieldErrors = {};

      console.log(this.registerForm.value);
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Esperar a que el estado de autenticación se actualice y luego navegar
          this.authService.isAuthenticated$.pipe(
            filter(isAuth => isAuth === true),
            take(1)
          ).subscribe(() => {
            this.loading = false;
            this.router.navigate(['/app']);
          });
        },
        error: (err) => {
          this.loading = false;
          console.error('Error en registro:', err);
          if (err.errors && err.errors.length > 0) {
            err.errors.forEach((error: any) => {
              this.fieldErrors[error.field] = error.message;
            });
          } else {
            this.error = err.message || 'Error al registrar usuario';
          }
        }
      })
    }
  }

  getFieldError(fieldName: string): string | null {
    return this.fieldErrors[fieldName] || null;
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.getFieldError(fieldName);
  }
}
