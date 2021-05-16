import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { User } from '../../../_models';
import { AlertService, UserService, AuthenticationService, VacationService, UtilService } from '../../../_services';

@Component({
    selector: 'app-add-overtime',
    templateUrl: './add-overtime.component.html'
})
export class AddOvertimeComponent implements OnInit {
    public user: User;
    public hr: User;
    public users: Map<string, User> = new Map<string, User>();

    public durationError: string = '';

    public duration: number = 0;
    public comments: string = '';

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
    }

    userName(user: User) {
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    loggedInUser() {
        return this.authService.getUser();
    }

    validate() {
        this.durationError = '';

        if (this.duration === 0) {
            this.durationError = 'Please add overtime in hours';
            return false;
        }

        return true;
    }

    submit() {
        if (!this.validate()) return;

        this.showProgress();
        this.vacationService.addOvertime({
            employeeId: this.user._id,
            overTimeDuration: this.duration,
            dateTime: new Date().toISOString(),
            comments: this.comments
        }).subscribe(data => {
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
