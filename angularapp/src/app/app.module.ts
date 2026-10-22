import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { AdminviewfeedbackComponent } from './components/adminviewfeedback/adminviewfeedback.component';
import { CreatesavingsplanComponent } from './components/createsavingsplan/createsavingsplan.component';
import { ErrorComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ManagereditenquiryComponent } from './components/managereditenquiry/managereditenquiry.component';
import { ManagereditsavingsplanComponent } from './components/managereditsavingsplan/managereditsavingsplan.component';
import { ManagerviewapplicationformComponent } from './components/managerviewapplicationform/managerviewapplicationform.component';
import { ManagerviewenquiriesComponent } from './components/managerviewenquiries/managerviewenquiries.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { UseraddenquiryComponent } from './components/useraddenquiry/useraddenquiry.component';
import { UseraddfeedbackComponent } from './components/useraddfeedback/useraddfeedback.component';
import { UserappliedplansComponent } from './components/userappliedplans/userappliedplans.component';
import { UsernavComponent } from './components/usernav/usernav.component';
import { UserplanapplicationformComponent } from './components/userplanapplicationform/userplanapplicationform.component';
import { UserviewenquiryComponent } from './components/userviewenquiry/userviewenquiry.component';
import { UserviewfeedbackComponent } from './components/userviewfeedback/userviewfeedback.component';
import { UserviewsavingsplanComponent } from './components/userviewsavingsplan/userviewsavingsplan.component';
import { ViewsavingsplanComponent } from './components/viewsavingsplan/viewsavingsplan.component';

// Interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NotificationComponent } from './components/notification/notification.component';
import { LoaderComponent } from './components/loader/loader.component';
import { FooterComponent } from './components/footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    AdminviewfeedbackComponent,
    CreatesavingsplanComponent,
    ErrorComponent,
    LoginComponent,
    HomeComponent,
    LoginComponent,
    ManagereditenquiryComponent,
    ManagereditsavingsplanComponent,
    ManagerviewapplicationformComponent,
    ManagerviewenquiriesComponent,
    NavbarComponent,
    RegistrationComponent,
    UseraddenquiryComponent,
    UseraddfeedbackComponent,
    UserappliedplansComponent,
    UsernavComponent,
    UserplanapplicationformComponent,
    UserviewenquiryComponent,
    UserviewfeedbackComponent,
    UserviewsavingsplanComponent,
    ViewsavingsplanComponent,
    NotificationComponent,
    LoaderComponent,
    FooterComponent,
   
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }