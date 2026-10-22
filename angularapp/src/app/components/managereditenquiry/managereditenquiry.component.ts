import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Enquiry } from 'src/app/models/enquiry.model';
import { EnquiryService } from 'src/app/services/enquiry.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-managereditenquiry',
  templateUrl: './managereditenquiry.component.html',
  styleUrls: ['./managereditenquiry.component.css']
})
export class ManagereditenquiryComponent implements OnInit {

  enquiryForm: FormGroup;
  enquiryId!: number;

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  showSuccessPopup = false;
  popupTitle = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private enquiryService: EnquiryService,
    private notificationService: NotificationService
  ) {
    this.enquiryForm = this.formBuilder.group({
      message: [
        {
          value: '',
          disabled: true
        }
      ],

      answer: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(500)
        ]
      ]
    });
  }

  ngOnInit(): void {

    this.showSuccessPopup = false;

    this.enquiryId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    if (!this.enquiryId) {
      this.errorMessage = 'Invalid enquiry ID.';
      return;
    }

    this.loadEnquiry();
  }

  loadEnquiry(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.enquiryService
      .getEnquiryById(String(this.enquiryId))
      .subscribe({
        next: (enquiry: Enquiry) => {

          this.enquiryForm.patchValue({
            message: enquiry.message,
            answer: enquiry.answer || ''
          });

          this.isLoading = false;
        },

        error: (error) => {

          console.error(
            'Unable to load enquiry:',
            error
          );

          this.errorMessage =
            typeof error.error === 'string' &&
            error.error.trim() !== ''
              ? error.error
              : 'Unable to load the enquiry.';

          this.isLoading = false;
        }
      });
  }

  submitAnswer(): void {

    const answerControl =
      this.enquiryForm.get('answer');

    if (answerControl?.invalid) {
      answerControl.markAsTouched();
      return;
    }

    const answer =
      answerControl?.value?.trim();

    this.isSubmitting = true;
    this.errorMessage = '';

    this.showSuccessPopup = false;

    this.enquiryService
  .answerEnquiry(
    String(this.enquiryId),
    answer
  )
  .subscribe({
    next: (updatedEnquiry: Enquiry) => {
      console.log(
        'Answer saved successfully:',
        updatedEnquiry
      );

      this.isSubmitting = false;

      this.notificationService.success(
        'The manager answer has been saved successfully.'
      );

      setTimeout(() => {
        this.router.navigate(['/admin/enquiries']);
      }, 1500);
    },

    error: (error) => {
      console.error(
        'Unable to submit answer:',
        error
      );

      const message =
        typeof error.error === 'string' &&
        error.error.trim() !== ''
          ? error.error
          : 'Unable to submit the answer.';

      this.notificationService.error(message);

      this.isSubmitting = false;
    }
  });
  }

  closeSuccessPopup(): void {

    this.showSuccessPopup = false;

    this.router.navigate(['/admin/enquiries']);
  }

  cancel(): void {

    this.router.navigate(['/admin/enquiries']);
  }
  clear():void{
    const answerControl = this.enquiryForm.get('answer');
    answerControl?.reset();
    this.errorMessage = ''
  }

  get answerControl() {
    return this.enquiryForm.get('answer');
  }
}