import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  public apiUrl =`${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  sendFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      feedback,
      { headers: this.getHeaders() }
    );
  }

  /* Use this method in UserviewfeedbackComponent */
  getAllFeedbacksByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  getAllFeedbacksByUserIdPage(userId: number, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/page?page=${page}&size=${size}`, { headers: this.getHeaders() });
  }

  getFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getFeedbacksPage(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/page?page=${page}&size=${size}`, { headers: this.getHeaders() });
  }

  deleteFeedback(feedbackId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${feedbackId}`,
      { headers: this.getHeaders() }
    );
  }

  searchAllFeedbacks(keyword: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, { headers: this.getHeaders() });
  }

  searchFeedbacksByUserId(userId: number, keyword: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, { headers: this.getHeaders() });
  }
}