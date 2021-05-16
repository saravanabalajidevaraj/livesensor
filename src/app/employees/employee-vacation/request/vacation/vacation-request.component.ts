import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { User, VacationReport } from '../../../../_models';
import { AlertService, UserService, AuthenticationService, ReportService, UtilService, VacationService } from '../../../../_services';

@Component({
  selector: 'app-vacation-request',
  templateUrl: './vacation-request.component.html'
})
export class VacationRequestComponent implements OnInit {
    public user: User;
    public users: Map<string, User> = new Map<string, User>();
    public types: Map<string, string> = new Map<string, string>();

    public reports: Array<VacationReport> = [];

    constructor(private authService: AuthenticationService,
                private userService: UserService,
                private utilService: UtilService,
                private alertService: AlertService,
                private reportService: ReportService,
                private vacationService: VacationService,
                private progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.vacationService.vacationTypes().subscribe(data => {
            this.types = data.reduce((acc, a) => {
                acc.set(a.code, a.description);
                return acc;
            }, new Map<string, string>());
        }, data => this.failure(data));
        this.refresh();
    }

    refresh() {
        this.reports = [];
        const date: Date = new Date();
        const toString = date => this.utilService.dateStringIgnoreTimezone(date);

        this.showProgress();
        this.user && this.reportService.getReports<VacationReport>('/vacation/report', {
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

    vacationType(type: string) {
        return this.types.get(type) || 'N/A';
    }

    loggedInUser() {
        return this.authService.getUser();
    }
}
