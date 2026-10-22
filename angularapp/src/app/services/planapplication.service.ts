import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlanApplication } from '../models/planapplication.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanapplicationService {
  
    constructor(private http: HttpClient) { }

    public apiUrl =`${environment.apiUrl}/planapplications`;
   
  
    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
  
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
  
    private handleError(error: any) {
      console.error('API Error:', error);
      return throwError(() => error);
    }
  
    addPlanApplication(data: PlanApplication): Observable<PlanApplication> {
      return this.http.post<PlanApplication>(
        this.apiUrl,
        data,
        { headers: this.getHeaders() }
      ).pipe(
        catchError(this.handleError)
      );
    }
  
    deletePlanApplication(planId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${planId}`,
        { headers: this.getHeaders() }
      ).pipe(
        catchError(this.handleError)
      );
    }
  
    getAppliedPlans(userId: number): Observable<PlanApplication[]> {
      return this.http.get<PlanApplication[]>(`${this.apiUrl}/user/${userId}`,
        { headers: this.getHeaders() }
      ).pipe(catchError(this.handleError));
    }

    getAppliedPlansPage(userId: number, page: number, size: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/user/${userId}/page?page=${page}&size=${size}`,
        { headers: this.getHeaders() }
      ).pipe(catchError(this.handleError));
    }
  
    getAllPlanApplications(): Observable<PlanApplication[]> {
      return this.http.get<PlanApplication[]>(
        this.apiUrl,
        { headers: this.getHeaders() }
      ).pipe(
        catchError(this.handleError)
      );
    }
  
    updatePlanApplication(planId: number,updatedData: PlanApplication): Observable<PlanApplication> {
      return this.http.put<PlanApplication>(
        `${this.apiUrl}/${planId}`,
        updatedData,
        { headers: this.getHeaders() }
      ).pipe(
        catchError(this.handleError)
      );
    }

    uploadImage(file: File) {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post(
        `${environment.apiUrl}/files/upload`,
        formData,
        { responseType: 'text' }
      );
    }

    searchAllApplications(keyword: string, page: number, size: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
    }

    searchApplicationsByUserId(userId: number, keyword: string, page: number, size: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/user/${userId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
    }
  }

  

