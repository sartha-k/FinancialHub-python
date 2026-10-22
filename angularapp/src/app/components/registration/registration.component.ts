import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  registerForm!: FormGroup;
  isSubmitting = false;
  roleDropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            )
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ],

        mobileNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9]\d{9}$/)
          ]
        ],

        userRole: [
          '',
          [
            Validators.required
          ]
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // Avoid showing password mismatch when fields are empty.
    if (!password || !confirmPassword) {
      return null;
    }

    if (password !== confirmPassword) {
      return {
        passwordMismatch: true
      };
    }

    return null;
  }

  selectRole(value: string): void {
    this.registerForm.get('userRole')?.setValue(value);
    this.registerForm.get('userRole')?.markAsTouched();
    this.roleDropdownOpen = false;
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      this.notificationService.warning(
        'Please fill all fields correctly.'
      );

      return;
    }

    const user = {
      username: this.registerForm.value.username.trim(),
      email: this.registerForm.value.email.trim(),
      password: CryptoJS.SHA256(
        this.registerForm.value.password
      ).toString(),
      mobileNumber: this.registerForm.value.mobileNumber,
      userRole: this.registerForm.value.userRole
    };

    this.isSubmitting = true;

    this.authService.register(user).subscribe({
      next: (res) => {
        console.log('Success', res);

        this.notificationService.success(
          'Registration Successful!'
        );

        this.registerForm.reset();
        this.isSubmitting = false;
        this.router.navigate(['/auth/login']);
      },

      error: (err) => {
        console.error('Registration error', err);

        this.notificationService.error(
          'Registration Failed!'
        );

        this.isSubmitting = false;
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}