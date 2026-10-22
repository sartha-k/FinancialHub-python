import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

  }

  login(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      this.notificationService.warning(
        'Please fill all required fields correctly.'
      );

      return;
    }

    this.isSubmitting = true;
    this.authService.login({
      email: this.loginForm.value.email,
      password: CryptoJS.SHA256(this.loginForm.value.password).toString()
    }).subscribe({

      next: (response: any) => {

        console.log('Login response:', response);

        const userId =
          response.userId ??
          response.user?.userId;

        const userRole =
          response.userRole ??
          response.user?.userRole ??
          response.user?.role;

        const username =
          response.username ??
          response.user?.username ??
          '';


        if (userId === null || userId === undefined) {

          this.notificationService.error(
            'User ID was not returned by the server.'
          );

          return;
        }

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('username', username);

        this.notificationService.success(
          'Login Successful!'
        );

        setTimeout(() => {

          if (userRole === 'ADMIN') {

          this.router.navigate(['/home']);

          }
          else if (userRole === 'USER') {

            this.router.navigate(['/home']);
  
            }

        }, 1000);

      },

      error: (error) => {

        console.error('Login error:', error);

        this.notificationService.error(
          'Invalid Email or Password'
        );
        this.isSubmitting = false;

      }

    });

  }

}