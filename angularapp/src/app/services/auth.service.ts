import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

export interface Login {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  register(user: User): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      user
    );
  }

  login(login: Login): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      login
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string {
    return localStorage.getItem('token');
  }


  logout(): void {
    localStorage.clear();
  }
}