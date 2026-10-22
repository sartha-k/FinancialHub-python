import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SavingsPlan } from '../models/savingsplan.model';
import { PlanApplication } from '../models/planapplication.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SavingsplanService {
  
  public apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  getAllSavingsPlans(): Observable<SavingsPlan[]> {
    return this.http.get<SavingsPlan[]>(`${this.apiUrl}/savingsplans`, this.getHeaders());
  }

  getSavingsPlansPage(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/savingsplans/page?page=${page}&size=${size}`, this.getHeaders());
  }

  getAppliedPlans(userId: string): Observable<PlanApplication[]> {
    return this.http.get<PlanApplication[]>(`${this.apiUrl}/planapplications/user/${userId}`, this.getHeaders());
  }

  getSavingsPlanById(id: string): Observable<SavingsPlan> {
    return this.http.get<SavingsPlan>(`${this.apiUrl}/savingsplans/${id}`, this.getHeaders());
  }

  addSavingsPlan(requestObject: SavingsPlan): Observable<SavingsPlan> {
    return this.http.post<SavingsPlan>(`${this.apiUrl}/savingsplans`, requestObject, this.getHeaders()
    );
  }

  updateSavingsPlan(id: number, requestObject: SavingsPlan): Observable<SavingsPlan> {
    return this.http.put<SavingsPlan>(`${this.apiUrl}/savingsplans/${id}`, requestObject, this.getHeaders());
  }

  deleteSavingsPlan(savingsPlanId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/savingsplans/${savingsPlanId}`, this.getHeaders());
  }

  searchSavingsPlans(keyword: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/savingsplans/search?keyword=${keyword}&page=${page}&size=${size}`, this.getHeaders());
  }
}
