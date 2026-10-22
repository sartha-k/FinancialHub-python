import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanApplication } from 'src/app/models/planapplication.model';
import { SavingsPlan } from 'src/app/models/savingsplan.model';
import { NotificationService } from 'src/app/services/notification.service';
import { PlanapplicationService } from 'src/app/services/planapplication.service';
import { SavingsplanService } from 'src/app/services/savingsplan.service';


@Component({
  selector: 'app-userplanapplicationform',
  templateUrl: './userplanapplicationform.component.html',
  styleUrls: ['./userplanapplicationform.component.css']
})
export class UserplanapplicationformComponent implements OnInit {
  applicationForm!: FormGroup;
  selectedFileName: string = '';
  selectedFile!: File;
  planId!: number;
  todayDate: string = '';
  isSubmitting = false;
  selectedPlan: SavingsPlan | null = null;
  maturityAmount: number | null = null;
  totalInterestEarned: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planApplicationService: PlanapplicationService,
    private savingsplanService: SavingsplanService,
    private notificationService: NotificationService
  ) { }


  @ViewChild('fileInput')
  fileInput!: ElementRef;

  ngOnInit(): void {
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
   
    this.todayDate = new Date().toISOString().split('T')[0];

    this.applicationForm = this.fb.group({
      appliedAmount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(10000000)]
      ],
      remarks: [''],
      proofDocument: ['', Validators.required]
    });

    this.savingsplanService.getSavingsPlanById(this.planId.toString()).subscribe({
      next: (plan) => { this.selectedPlan = plan; },
      error: (err) => console.error('Failed to load plan', err)
    });
  }

  get f() {
    return this.applicationForm.controls;
  }

  onAmountChange(): void {
    const amount = Number(this.applicationForm.get('appliedAmount')?.value);
    if (this.selectedPlan && amount > 0 && this.applicationForm.get('appliedAmount')?.valid) {
      const rate = this.selectedPlan.rateOfInterest;
      const years = this.selectedPlan.timeFrame;
      const maturity = Math.round(amount * Math.pow(1 + rate / 100, years) * 100) / 100;
      this.maturityAmount = maturity;
      this.totalInterestEarned = Math.round((maturity - amount) * 100) / 100;
    } else {
      this.maturityAmount = null;
      this.totalInterestEarned = null;
    }
  }

  onFileSelected(event: any): void {

    const file = event.target.files[0];
  
    if (file) {
  
      this.selectedFile = file;
  
      this.selectedFileName = file.name;

      this.applicationForm.patchValue({proofDocument: file.name});
  
    }
  }

  submitForm(): void {

    console.log('Submit clicked');
    console.log('Form Valid:', this.applicationForm.valid);
    console.log('Form Value:', this.applicationForm.value);
  
    if (this.applicationForm.invalid) {
  
      console.log('Form Invalid');
  
      this.applicationForm.markAllAsTouched();
  
      return;
    }
  
    console.log('Starting Image Upload');
  
    this.isSubmitting = true;
    this.planApplicationService.uploadImage(this.selectedFile).subscribe({
    next: (imageUrl) => {
      console.log('Image Uploaded');
      console.log(imageUrl);

      const planApplication: PlanApplication = {
        appliedAmount: this.applicationForm.value.appliedAmount,
        applicationDate: this.applicationForm.value.applicationDate,
        remarks: this.applicationForm.value.remarks,
        proofDocument: imageUrl,
        status: 'PENDING',
        user: { userId: Number(localStorage.getItem('userId')) } as any,
        savingsPlan: { savingsPlanId: this.planId } as any
      };

      this.planApplicationService
        .addPlanApplication(planApplication)
        .subscribe({

          next: (response) => {

            console.log('Application Added', response);

            this.notificationService.success(
              'Plan Application Submitted Successfully!'
            );

            this.applicationForm.reset();
            this.selectedFileName = '';

            this.router.navigate(['/user/applied-plans']);
          },

          error: (error) => {

            console.error('Application Save Failed', error);

            this.notificationService.error(
              'Failed to save application'
            );
          }

        });

    },

    error: (err) => {

      console.error('Upload Failed', err);

      this.notificationService.error(
        'Failed to upload document'
      );
      this.isSubmitting = false;

    }

  });
  }

  closeModal(): void {

    this.notificationService.success('Plan Application Submitted Successfully!');
    this.router.navigate(['/user/applied-plans']);

  }

  goBack(): void {
    this.router.navigate(['/user/savings-plans']);
  }

removeFile(): void {

  this.selectedFileName = '';

  this.selectedFile = undefined as any;

  this.applicationForm.patchValue({
    proofDocument: ''
  });

  this.fileInput.nativeElement.value = '';

}

}
