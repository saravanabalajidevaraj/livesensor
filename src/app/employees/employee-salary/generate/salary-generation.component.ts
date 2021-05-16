import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { Holiday, User } from '../../../_models';
import { AlertService, HolidayService, UtilService, SalaryService } from '../../../_services';

@Component({
    selector: 'app-salary-generation',
    templateUrl: './salary-generation.component.html'
})
export class SalaryGenerationComponent implements OnInit {
    public user: User;
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public holidays: Array<Holiday> = [];

    public workingDays: number = 0;
    public creditDate: string = this.today;

    public daysError: string = '';

    constructor(protected salaryService: SalaryService,
                protected alertService: AlertService,
                protected utilService: UtilService,
                protected holidayService: HolidayService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.showProgress();
        const date: Date = new Date();
        const toString = date => this.utilService.dateStringIgnoreTimezone(date);

        let year = date.getFullYear();
        const monthSpan = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            monthSpan[1] = 29;
        }

        let month = date.getMonth() - 1;
        if (month < 0) {
            month += 12;
            year -= 1;
        }
        this.holidayService.getHolidays({
            fromDate: toString(new Date(year, month, 1, 0, 0, 0)),
            toDate: toString(new Date(year, month, monthSpan[month], 0, 0, 0))
        }).subscribe(data => {
          this.hideProgress();
          this.holidays = data;
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
    }

    private validate() {
        this.daysError = '';

        if (this.workingDays <= 0) {
            this.daysError = 'Value must be greater than 0';
            return false;
        }

        return true;
    }

    submit() {
        if (!this.validate()) return;

        this.showProgress();
        this.salaryService.triggerPayslip({
            workingDays: this.workingDays,
            holidays: this.holidays.length,
            creditDate: this.creditDate
        }).subscribe(data => {
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
