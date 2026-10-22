import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  show = false;
  message = '';
  type = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {

    this.notificationService.notification$.subscribe(
      (notification) => {

        this.message = notification.message;
        this.type = notification.type;
        this.show = true;

        setTimeout(() => {
          this.show = false;
        }, 3000);
      }
    );
  }
}