import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { User, OvertimeReport } from '../../../../_models';
import { AlertService, UserService, AuthenticationService, ReportService, UtilService } from '../../../../_services';

@Component({
  selector: 'app-overtime-request',
  templateUrl: './overtime-request.component.html'
})
export class OvertimeRequestComponent implements OnInit {
    public user: User;
    public users: Map<string, User> = new Map<string, User>();

    public reports: Array<OvertimeReport> = [];

    constructor(private authService: AuthenticationService,
                private userService: UserService,
                private utilService: UtilService,
                private alertService: AlertService,
                private reportService: ReportService,
                private progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.refresh();
    }

    refresh() {
        if (!this.user) return;

        this.reports = [];
        const date: Date = new Date();
        const toString = date => this.utilService.dateStringIgnoreTimezone(date);

        this.showProgress();
        this.reportService.getReports<OvertimeReport>('/overtime/report', {
            employeeId: this.user._id,
            fromDate: toString(new Date(date.getFullYear(), 0, 1, 0, 0, 0)),
            toDate: toString(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0))
        }).subscribe(data => {
            this.hideProgress();
            this.reports = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
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

    changeUser(user: User) {
        this.user = user;
        this.refresh();
    }

    userName(userId: string) {
        const user = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || userId;
    }

    loggedInUser() {
        return this.authService.getUser();
    }
}
