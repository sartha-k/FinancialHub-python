import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SavingsplanService } from 'src/app/services/savingsplan.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-managereditsavingsplan',
  templateUrl: './managereditsavingsplan.component.html',
  styleUrls: ['./managereditsavingsplan.component.css']
})
export class ManagereditsavingsplanComponent implements OnInit {

  savingsPlanForm!: FormGroup;
  savingsPlanId!: number;
  submitted: boolean = false;
  showSuccessPopup = false;
  successMessage = '';

  constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router,
    private savingsPlanService: SavingsplanService,private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.savingsPlanForm = this.fb.group({
      name: ['', Validators.required],
      rateOfInterest: ['', [Validators.required, Validators.min(0.001), Validators.max(100)]],
      timeFrame: ['', Validators.required],
      riskLevel: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.savingsPlanId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.getSavingsPlanById();
  }

  getSavingsPlanById(): void {
    this.savingsPlanService.getSavingsPlanById(this.savingsPlanId.toString()).subscribe({next: (data) => {
          this.savingsPlanForm.patchValue({
            name: data.name,
            rateOfInterest: data.rateOfInterest,
            timeFrame: data.timeFrame,
            riskLevel: data.riskLevel,
            description: data.description,
            status: data.status
          });

        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to load savings plan details!');
        }
      });
  }

  updateSavingsPlan(): void {
    this.submitted = true;
    if (this.savingsPlanForm.invalid) {
      this.notificationService.warning('Please fill all fields correctly.');
      return;
    }

    this.savingsPlanService.updateSavingsPlan(this.savingsPlanId,this.savingsPlanForm.value).subscribe({next: () => {
          this.notificationService.success('Savings Plan Updated Successfully!');
          this.router.navigate(['/admin/savings-plans']);
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to update savings plan!');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/savings-plans']);
  }
}