import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SavingsPlan {
  savingsPlanId: number;
  name: string;
  rateOfInterest: number;
  timeFrame: number;
  riskLevel: string;
  description: string;
  status: string;
}

export interface SavingsPlanResponse {
  content: SavingsPlan[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SavingsPlanService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/savingsPlan';

  getAllSavingsPlans(): Observable<SavingsPlanResponse> {
    return this.http.get<SavingsPlanResponse>(this.apiUrl);
  }
}