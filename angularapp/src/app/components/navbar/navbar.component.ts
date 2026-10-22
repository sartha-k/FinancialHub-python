import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) { }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get role(): string {
    return localStorage.getItem('role') || '';
  }

  get username(): string {
    return localStorage.getItem('username') || 'User';
  }

  get email(): string {
    return localStorage.getItem('email') || '';
  }

  logout(): void {

    localStorage.clear();

    this.notificationService.success(
      'Logged out successfully'
    );

    this.router.navigate(['/auth/login']);
  }

}