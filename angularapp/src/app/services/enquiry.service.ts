import { HttpClient } from "@angular/common/http";
import { Enquiry } from "../models/enquiry.model";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  public apiUrl = `${environment.apiUrl}/enquiries`;


  constructor(private http: HttpClient) {}

  addEnquiry(enquiry: Enquiry):Observable<Enquiry> {
    return this.http.post<Enquiry>(this.apiUrl,enquiry);
  }

  getAllEnquiry():Observable<Enquiry[]>{
    return this.http.get<Enquiry[]>(this.apiUrl);
  }

  getEnquiryById(id: string):Observable<Enquiry>{
    return this.http.get<Enquiry>(`${this.apiUrl}/${id}`);
  }

  getUserEnquiries(userId: string):Observable<Enquiry[]>{
    return this.http.get<Enquiry[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateEnquiry(id: string, enquiry: Enquiry):Observable<Enquiry>{
    return this.http.put<Enquiry>(`${this.apiUrl}/${id}`,enquiry);
  }

  deleteEnquiry(id: string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  answerEnquiry(id: string, answer: string): Observable<Enquiry> {
    return this.http.put<Enquiry>(`${this.apiUrl}/${id}/answer`, { answer });
  }
  searchAllEnquiries(keyword: string): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`);
  }

  searchUserEnquiries(userId: string, keyword: string): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(`${this.apiUrl}/user/${userId}/search?keyword=${encodeURIComponent(keyword)}`);
  }
}