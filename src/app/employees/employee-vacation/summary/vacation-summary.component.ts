import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { User } from '../../../_models';
import { AlertService, UserService, AuthenticationService, VacationService } from '../../../_services';

@Component({
  selector: 'app-vacation-summary',
  templateUrl: './vacation-summary.component.html'
})
export class VacationSummaryComponent implements OnInit {
    public user: User;

    public loginUser: User = this.authService.getUser();
    public isSO: boolean = this.loginUser.role === 'SO';
    public isOE: boolean = this.loginUser.role === 'OE';
    public isAdmin: boolean = this.loginUser.role === 'ADMIN' || this.loginUser.role === 'HR';

    public users: Map<string, User> = new Map<string, User>();

    public leftBalance: number = 0;
    public overTimeBalance: number = 0;

    constructor(protected authService: AuthenticationService,
                protected userService: UserService,
                protected alertService: AlertService,
                protected vacationService: VacationService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.refresh();
    }

    refresh() {
        if (!this.user) return;

        this.showProgress();
        this.vacationService.userVacationBalance(this.user._id).subscribe(data => {
            this.hideProgress();
            const {a: assignedBalance, u: usedBalance} = Object.keys(data.vacationBalance).reduce((sum, a) => {
                sum.a += data.vacationBalance[a].assignedBalance;
                sum.u += data.vacationBalance[a].usedBalance;
                return sum;
            }, {a: 0, u: 0});
            this.leftBalance = assignedBalance - usedBalance;
            this.overTimeBalance = data.overTimeBalance;
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

    failure(message: string) {
        this.alertService.error(message);
    }

    changeUser(user: User) {
        this.user = user;
        this.refresh();
    }
}
