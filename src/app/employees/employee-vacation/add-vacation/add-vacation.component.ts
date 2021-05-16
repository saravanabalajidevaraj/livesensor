import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { User, VacationDetail, VacationType } from '../../../_models';
import { AlertService, UserService, AuthenticationService, VacationService, UtilService } from '../../../_services';

@Component({
  selector: 'app-add-vacation',
  templateUrl: './add-vacation.component.html'
})
export class AddVacationComponent implements OnInit {
    public vacationTypes: Array<VacationType> = [];
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public user: User;
    public balance: VacationDetail;
    public hr: User;
    public users: Map<string, User> = new Map<string, User>();

    public from: string = this.today;
    public to: string = this.today;
    public type: string = '';
    public duration: number = this.getDuration();
    public comments: string = '';
    public doc: any;

    public durationError: string = '';
    public typeError: string = '';

    constructor(protected router: Router,
                protected authService: AuthenticationService,
                protected userService: UserService,
                protected alertService: AlertService,
                protected vacationService: VacationService,
                protected utilService: UtilService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getActive().subscribe(data => this.users = data, data => this.failure(data));
        this.userService.getHr().subscribe(data => this.hr = data[0], data => this.failure(data));
        this.vacationService.vacationTypes().subscribe(data => this.vacationTypes = data, data => this.failure(data));
        this.refresh();
    }

    refresh() {
        if (!this.user) return;
        this.vacationService.userVacationBalance(this.user._id).subscribe(data => this.balance = data, data => this.failure(data))
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

    userName(user: User) {
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || '';
    }

    loggedInUser() {
        return this.authService.getUser();
    }

    getDuration() {
        return this.utilService.daysWithOneDayWeekend(new Date(this.from), new Date(this.to));
    }

    updateFrom(from: string) {
        this.from = from;
        this.duration = this.getDuration();
    }

    updateTo(to: string) {
        this.to = to;
        this.duration = this.getDuration();
    }

    validate() {
        this.durationError = '';
        this.typeError = '';

        const startDate = new Date(this.from);
        const endDate = new Date(this.to);

        if (this.type.length === 0) {
            this.typeError = 'Vacation type is required';
            return false;
        }

        if (startDate > endDate) {
            this.durationError = 'From date should be equal to or before To date';
            return false;
        }

        const vacationType = this.balance.vacationBalance[this.type];
        const pendingVacations = vacationType.assignedBalance - vacationType.usedBalance;
        if (this.duration > pendingVacations) {
            this.durationError = `Only ${pendingVacations} vacation(s) left for the user`;
            return false;
        }

        return true;
    }

    submit() {
        if (!this.validate()) return;

        const formData = new FormData();
        formData.append('employeeId', this.user._id);
        formData.append('leaveTypeCode', this.type);
        formData.append('fromDate', new Date(this.from).toISOString());
        formData.append('toDate', new Date(this.to).toISOString());
        formData.append('duration', String(this.duration));
        formData.append('comments', this.comments);
        if (this.doc) formData.append('document', this.doc);

        this.showProgress();
        this.vacationService.addVacation(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.router.navigate(['vacation']);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
