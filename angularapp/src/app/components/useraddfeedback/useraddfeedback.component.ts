import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-useraddfeedback',
  standalone: false,
  templateUrl: './useraddfeedback.component.html',
  styleUrls: ['./useraddfeedback.component.css']
})
export class UseraddfeedbackComponent implements OnInit {

  feedbackForm!: FormGroup;

  errorMessage = '';

  isSubmitting = false;
  isLoading = false;



  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.feedbackForm = this.fb.group({
      feedbackText: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(500)
        ]
      ]
    });
  }

  onSubmit(): void {

    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.errorMessage =
        'User ID is not available. Please login again.';

      this.notificationService.error(
        this.errorMessage
      );

      return;
    }

    const feedback = {
      feedbackText:
        this.feedbackForm.value.feedbackText.trim(),
      user: {
        userId: Number(userId)
      }
    };

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = '';

    this.feedbackService
      .sendFeedback(feedback)
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.isLoading = false;
            this.isSubmitting = false;

            this.feedbackForm.reset();

            this.notificationService.success(
              'Your feedback has been submitted successfully.'
            );

            this.router.navigate(['/user/feedback']);
          }, 1500);
        },

        error: (error) => {
          console.error(
            'Error while adding feedback:',
            error
          );

          const message =
            typeof error.error === 'string' &&
            error.error.trim() !== ''
              ? error.error
              : error.error?.message ||
                'Unable to add feedback. Please try again.';

          setTimeout(() => {
            this.isLoading = false;
            this.isSubmitting = false;

            this.errorMessage = message;

            this.notificationService.error(
              message
            );
          }, 1500);
        }
      });
  }

  resetForm(): void {
    this.feedbackForm.reset();
    this.errorMessage = '';
  }
}