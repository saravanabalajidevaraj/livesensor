import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { AttendanceReport, User, Site } from '../_models';
import { AlertService, AttendanceService, EventService, NotificationService, SiteService, UserService, UtilService } from '../_services';

@Component({
    selector: 'overtime',
    templateUrl: './overtime.component.html'
})
export class OvertimeComponent implements OnInit {

    private users: Map<string, User> = new Map<string, User>();
    private sites: Map<string, Site> = new Map<string, Site>();

    public noteId: string;
    public item: AttendanceReport;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected utilService: UtilService,
                protected userService: UserService,
                protected siteService: SiteService,
                protected eventService: EventService,
                protected notificationService: NotificationService,
                protected attendanceService: AttendanceService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.siteService.getNames().subscribe(data => this.sites = data, data => this.failure(data));

        this.route.params.subscribe(paramMap => {
            const { noteId, attendanceId } = paramMap;
            if (attendanceId) {
                this.showProgress();
                this.attendanceService.getReport(attendanceId).subscribe(data => {
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

    userName(userId: string) {
        var user: User = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    siteName(siteId: string) {
        var site: Site = this.sites.get(siteId);
        return site && site.siteName || 'N/A';
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
