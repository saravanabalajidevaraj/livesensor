import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { FeedbackService, AlertService, UserService, UtilService, NotificationService, EventService } from '../_services';
import { User, Feedback } from '../_models';

@Component({
    selector: 'app-management',
    templateUrl: 'management.component.html'
})
export class ManagementComponent implements OnInit {
    public users: Map<string, User> = new Map<string, User>();

    public noteId: string;
    public item: Feedback;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private eventService: EventService,
                private utilService: UtilService,
                private userService: UserService,
                private alertService: AlertService,
                private progress: NgxSpinnerService,
                private notificationService: NotificationService,
                private feedbackService: FeedbackService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));

        this.route.params.subscribe(paramMap => {
            const { noteId, feedbackId } = paramMap;
            if (feedbackId) {
                this.showProgress();
                this.feedbackService.getFeedback(feedbackId).subscribe(data => {
                    this.hideProgress();
                    this.item = data;

                    if (noteId) this.noteId = noteId;
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                });
            }
        });
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    success(message: string) {
        this.alertService.success(message);
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    approve() {
        this.showProgress();
        this.notificationService.approve(this.noteId).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.eventService.triggerHeaderRefresh();
                this.router.navigate(['/notifications']);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
