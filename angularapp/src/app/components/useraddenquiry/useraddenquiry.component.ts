import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { Enquiry } from 'src/app/models/enquiry.model';
import { EnquiryService } from 'src/app/services/enquiry.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-useraddenquiry',
  standalone: false,
  templateUrl: './useraddenquiry.component.html',
  styleUrls: ['./useraddenquiry.component.css']
})
export class UseraddenquiryComponent {

  enquiryForm: FormGroup;

  isSubmitting = false;
  isLoading = false;

  errorMessage = '';

  showSuccessPopup = false;
  popupTitle = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private enquiryService: EnquiryService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.enquiryForm = this.formBuilder.group({
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(500)
        ]
      ]
    });
  }

  addEnquiry(): void {

    if (this.enquiryForm.invalid) {
      this.enquiryForm.markAllAsTouched();
      return;
    }

    const enquiry: Enquiry = {
      message: this.enquiryForm.value.message.trim(),
      answer: ''
    };

    this.isSubmitting = true;
    this.isLoading = true;

    this.errorMessage = '';
    this.showSuccessPopup = false;

    this.enquiryService
      .addEnquiry(enquiry)
      .subscribe({
        next: (savedEnquiry: Enquiry) => {

          console.log(
            'Enquiry added successfully:',
            savedEnquiry
          );

          setTimeout(() => {
            this.isLoading = false;
            this.isSubmitting = false;

            this.enquiryForm.reset();

            this.notificationService.success(
              'Your enquiry has been submitted successfully.'
            );

            this.router.navigate(['/user/enquiries']);
          }, 1500);
        },

        error: (error) => {

          console.error(
            'Unable to add enquiry:',
            error
          );

          const message =
            typeof error.error === 'string' &&
            error.error.trim() !== ''
              ? error.error
              : error.error?.message ||
                'Unable to add enquiry. Please try again.';

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
    this.enquiryForm.reset();
    this.errorMessage = '';
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;

    this.router.navigate(['/user/enquiries']);
  }

  get messageControl() {
    return this.enquiryForm.get('message');
  }
}
