import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { User, VacationDetail, VacationType } from '../../../_models';
import { AlertService, UserService, AuthenticationService, VacationService } from '../../../_services';

@Component({
  selector: 'app-vacation-balance',
  templateUrl: './vacation-balance.component.html'
})
export class VacationBalanceComponent implements OnInit {
    public users: Map<string, User> = new Map<string, User>();
    public userIds: Array<string> = [];
    public usersSorted: Array<string> = [];

    public oldBalance: Map<string, VacationDetail> = new Map<string, VacationDetail>();
    public balance: Map<string, VacationDetail> = new Map<string, VacationDetail>();
    public types: Array<VacationType> = [];

    public resetConfirm: boolean = false;

    constructor(protected authService: AuthenticationService,
                protected progress: NgxSpinnerService,
                protected userService: UserService,
                protected alertService: AlertService,
                protected vacationService: VacationService) { }

    ngOnInit() {
        this.showProgress();
        Observable.forkJoin([
            this.userService.getActive(),
            this.vacationService.vacationBalance(),
            this.vacationService.vacationTypes()
        ]).subscribe(data => {
            this.hideProgress();
            this.users = data[0];
            this.oldBalance = data[1];
            this.balance = new Map(JSON.parse(JSON.stringify(Array.from(data[1]))));
            this.types = data[2];

            const usersSorted = Array.from(data[0]).map(a => a[0]);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.usersSorted = usersSorted;
            this.userIds = usersSorted;
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

    userFor(userId: string) {
        return this.users.get(userId);
    }

    filter(search: string) {
        this.userIds = this.usersSorted.filter(a => this.userName(a).toLowerCase().includes(search.toLowerCase()));
    }

    userName(userId: string) {
        const user: User = this.userFor(userId);
        return user && `${user.firstName} ${user.lastName}` || 'N/A';
    }

    getAssigned(userId: string, type: string) {
        return this.balance.get(userId).vacationBalance[type].assignedBalance;
    }

    setAssigned(userId: string, type: string, value: string) {
        this.balance.get(userId).vacationBalance[type].assignedBalance = Number(value);
    }

    getUsed(userId: string, type: string) {
        return this.balance.get(userId).vacationBalance[type].usedBalance;
    }

    setUsed(userId: string, type: string, value: string) {
        this.balance.get(userId).vacationBalance[type].usedBalance = Number(value);
    }

    reset() {
        this.showProgress();
        this.vacationService.resetVacationBalance().subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.ngOnInit();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    submit() {
        const values = Array.from(this.balance)
            .filter(a => {
                const oldBalance = this.oldBalance.get(a[0]).vacationBalance;
                const newBalance = a[1].vacationBalance;
                return Object.keys(newBalance).some(type => {
                    return newBalance[type].assignedBalance !== oldBalance[type].assignedBalance ||
                        newBalance[type].usedBalance !== oldBalance[type].usedBalance;
                });
            })
            .map(a => ({
                _id: a[1]._id,
                vacationBalance: a[1].vacationBalance
            }));

        this.showProgress();
        this.vacationService.updateVacationBalance({vacationBalanceData: values}).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
