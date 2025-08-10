import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  canLogin: boolean = true;
  canRegister: boolean = true;
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  ngOnInit() {
    this.checkAuthStatus();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  checkAuthStatus() {
    this.isLoading = true;
    this.authSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => {
        this.isAuthenticated = isAuth;
        this.isLoading = false;
      }
    });

    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      }
    });
    this.authService.initAuthService();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }



  
  getGridCellClass(index: number): string {
    const row = Math.floor((index - 1) / 10);
    const col = (index - 1) % 10;
    const loteria = [12, 13, 14, 27, 37, 47, 63, 64, 65, 66, 82, 92];
    const ganadoras = [23, 45, 67, 89];
    const marcadas = [15, 25, 35, 55, 75, 85];
    
    if (loteria.includes(index)) {
      return 'bg-red-600 hover:bg-red-500';
    } else if (ganadoras.includes(index)) {
      return 'bg-yellow-600 hover:bg-yellow-500';
    } else if (marcadas.includes(index)) {
      return 'bg-green-600 hover:bg-green-500';
    } else {
      return 'bg-orange-300/50 hover:bg-orange-400/50';
    }
  }


  get gridCells(): number[] {
    return Array.from({ length: 100 }, (_, i) => i + 1);
  }
}