/**
 * app.ts
 *
 * This is the root component of the Angular application.
 * It is the first component that loads in the browser. On startup it fetches
 * the list of savings plans from the backend and stores them so the template
 * can display them. Think of it as the main page controller.
 */
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SavingsPlan, SavingsPlanService } from './service/ssavings-plan';

// Root component — fetches and holds the savings plans list on init
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private savingsPlanService = inject(SavingsPlanService);

  savingsPlans: SavingsPlan[] = [];

  // Loads savings plans from the API when the component initialises
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