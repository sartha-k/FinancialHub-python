import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  currentYear: number = new Date().getFullYear();
  isLoggedIn: boolean = false;

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }
}