import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // User not logged in
  if (!token) {
    notificationService.warning('Please login to continue.');
    return router.createUrlTree(['/auth/login']);
  }

  const expectedRole = route.data?.['role'];

  // User logged in but role mismatch
  if (expectedRole && role !== expectedRole) {

    notificationService.error(
      'Access Denied! You are not authorized to access this page.'
    );

    return router.createUrlTree(['/home']);
  }

  return true;
};