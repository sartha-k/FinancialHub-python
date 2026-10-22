import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notification$ = new Subject<{
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  }>();

  success(message: string) {
    this.notification$.next({ type: 'success', message });
  }

  error(message: string) {
    this.notification$.next({ type: 'error', message });
  }

  warning(message: string) {
    this.notification$.next({ type: 'warning', message });
  }

  info(message: string) {
    this.notification$.next({ type: 'info', message });
  }
}