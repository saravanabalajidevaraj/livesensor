import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { NotificationService, ItemService, AlertService, TransferService, EventService } from '../_services';
import { Notification } from '../_models';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
    public learnings: Array<Notification> = [];
    public notifications: Array<Notification> = [];

    constructor(private router: Router,
                private itemService: ItemService,
                private alertService: AlertService,
                private eventService: EventService,
                private progress: NgxSpinnerService,
                private transferService: TransferService,
                private notificationService: NotificationService) { }

    ngOnInit() {
        this.showProgress();
        this.notificationService.getNotifications().subscribe(data => {
            this.hideProgress();
            this.eventService.triggerHeaderRefresh();
            this.learnings = data.learnings;
            this.notifications = data.notifications;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    image(type: string) {
        return `assets/img/${this.itemService.image(type)}.png`;
    }

    notificationView(notification: Notification) {
        return this.router.navigate([this.itemService.urlEndpoint(notification)]);
    }
}
