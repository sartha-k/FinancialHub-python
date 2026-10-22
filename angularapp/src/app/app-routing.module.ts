import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UseraddenquiryComponent } from './components/useraddenquiry/useraddenquiry.component';
import { UserviewenquiryComponent } from './components/userviewenquiry/userviewenquiry.component';
import { ManagerviewapplicationformComponent } from './components/managerviewapplicationform/managerviewapplicationform.component';
import { ManagerviewenquiriesComponent } from './components/managerviewenquiries/managerviewenquiries.component';
import { ManagereditenquiryComponent } from './components/managereditenquiry/managereditenquiry.component';
import { LoginComponent } from './components/login/login.component';
import { UseraddfeedbackComponent } from './components/useraddfeedback/useraddfeedback.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { HomeComponent } from './components/home/home.component';
import { CreatesavingsplanComponent } from './components/createsavingsplan/createsavingsplan.component';
import { ViewsavingsplanComponent } from './components/viewsavingsplan/viewsavingsplan.component';
import { ManagereditsavingsplanComponent } from './components/managereditsavingsplan/managereditsavingsplan.component';
import { UserviewsavingsplanComponent } from './components/userviewsavingsplan/userviewsavingsplan.component';
import { UserviewfeedbackComponent } from './components/userviewfeedback/userviewfeedback.component';
import { AdminviewfeedbackComponent } from './components/adminviewfeedback/adminviewfeedback.component';
import { UserplanapplicationformComponent } from './components/userplanapplicationform/userplanapplicationform.component';
import { UserappliedplansComponent } from './components/userappliedplans/userappliedplans.component';
import { ErrorComponent } from './components/error/error.component';

import { authGuard } from './gaurds/auth.gaurds';

const routes: Routes = [

  // Default
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Authentication
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegistrationComponent },

  // Home
  { path: 'home', component: HomeComponent },

  // User routes
  {
    path: 'user/enquiries/add',
    component: UseraddenquiryComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/enquiries',
    component: UserviewenquiryComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/savings-plans',
    component: UserviewsavingsplanComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/feedback/add',
    component: UseraddfeedbackComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/feedback',
    component: UserviewfeedbackComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/savings-plans/:id/apply',
    component: UserplanapplicationformComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },
  {
    path: 'user/applied-plans',
    component: UserappliedplansComponent,
    canActivate: [authGuard],
    data: { role: 'USER' }
  },

  // Admin routes
  {
    path: 'admin/enquiries',
    component: ManagerviewenquiriesComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/enquiries/:id/edit',
    component: ManagereditenquiryComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/savings-plans/create',
    component: CreatesavingsplanComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/savings-plans',
    component: ViewsavingsplanComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/savings-plans/:id/edit',
    component: ManagereditsavingsplanComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/feedback',
    component: AdminviewfeedbackComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/applications',
    component: ManagerviewapplicationformComponent,
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },

  { path: '**', component: ErrorComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }