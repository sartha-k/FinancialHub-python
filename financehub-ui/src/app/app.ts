import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SavingsPlan, SavingsPlanService } from './service/ssavings-plan';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private savingsPlanService = inject(SavingsPlanService);

  savingsPlans: SavingsPlan[] = [];

  ngOnInit(): void {
    this.savingsPlanService.getAllSavingsPlans().subscribe({
      next: (response) => {
        this.savingsPlans = response.content;
        console.log('Savings Plans:', this.savingsPlans);
      },
      error: (error) => {
        console.error('FastAPI Error:', error);
      }
    });
  }
}