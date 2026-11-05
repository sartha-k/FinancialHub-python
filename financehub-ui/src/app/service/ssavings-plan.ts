/**
 * service/ssavings-plan.ts
 *
 * This file is the Angular service responsible for talking to the FastAPI backend.
 * It defines the TypeScript interfaces that describe what a savings plan looks like,
 * and provides a single injectable service class with methods for making HTTP calls.
 * Any component that needs savings plan data should inject this service rather than
 * making HTTP calls directly.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Shape of a single savings plan returned by the API
export interface SavingsPlan {
  savingsPlanId: number;
  name: string;
  rateOfInterest: number;
  timeFrame: number;
  riskLevel: string;
  description: string;
  status: string;
}

// Paginated API response wrapping a list of savings plans
export interface SavingsPlanResponse {
  content: SavingsPlan[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Service for communicating with the savings plan FastAPI endpoints
@Injectable({
  providedIn: 'root'
})
export class SavingsPlanService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/savingsPlan';

  // Fetches all savings plans from the API
  getAllSavingsPlans(): Observable<SavingsPlanResponse> {
    return this.http.get<SavingsPlanResponse>(this.apiUrl);
  }
}