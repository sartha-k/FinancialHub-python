import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SavingsplanService } from 'src/app/services/savingsplan.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-createsavingsplan',
  templateUrl: './createsavingsplan.component.html',
  styleUrls: ['./createsavingsplan.component.css']
})
export class CreatesavingsplanComponent implements OnInit {

  savingsPlanForm!: FormGroup;
  submitted: boolean = false;
  isSubmitting = false;
  riskDropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private savingsPlanService: SavingsplanService,
    private notificationService: NotificationService,
    private router: Router) { }

  ngOnInit(): void {
    this.savingsPlanForm = this.fb.group({
      name: ['', Validators.required],
      rateOfInterest: ['', [Validators.required, Validators.min(0.001), Validators.max(100)]],
      timeFrame: ['', Validators.required],
      riskLevel: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Pending']
    });
  }

  selectRisk(value: string): void {
    this.savingsPlanForm.get('riskLevel')?.setValue(value);
    this.riskDropdownOpen = false;
  }

  createSavingsPlan(): void {
    this.submitted = true;
    if (this.savingsPlanForm.invalid) {
      this.notificationService.warning('Please fill all fields correctly.');
      return;
    }

    this.savingsPlanForm.patchValue({ status: 'Pending' });
    this.isSubmitting = true;
    this.savingsPlanService.addSavingsPlan(this.savingsPlanForm.value).subscribe({
      next: () => {
        this.notificationService.success('Savings Plan Created Successfully!');
        this.router.navigate(['/admin/savings-plans']);
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to Create Savings Plan!');
        this.isSubmitting = false;
      }
    });
  }
}