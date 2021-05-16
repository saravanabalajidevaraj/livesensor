import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import * as jsPDF from 'jspdf'

import { User } from '../../../_models';
import { AlertService, UtilService, DownloadService, SalaryService } from '../../../_services';

@Component({
    selector: 'app-salary-payslip',
    templateUrl: './salary-payslip.component.html'
})
export class SalaryPayslipComponent implements OnInit {
    public user: User;
    public months: Array<string> = [];

    public selected: number = 0;

    constructor(protected salaryService: SalaryService,
                protected alertService: AlertService,
                protected utilService: UtilService,
                protected progress: NgxSpinnerService,
                protected downloadService: DownloadService) { }

    ngOnInit() {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();

        let month = now.getMonth();
        let year = now.getFullYear();
        this.months = new Array(8).fill(0).map(a => {
            if (month === 0) {
                month += 12;
                year -= 1;
            }
            return `${monthNames[--month]} ${year}`;
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

    displayName(user: User) {
        return user && `${user.firstName} ${user.lastName}` || 'N/A';
    }

    userName(user: User) {
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    generate() {
        if (!this.user) return;

        const now = new Date();

        let month = now.getMonth();
        let year = now.getFullYear();
        if (month - this.selected <= 0) {
            month += 12;
            year -= 1;
        }

        const payslipDate = `${month - this.selected}-${year}`;

        this.showProgress();
        this.salaryService.fetchPayslip({
            employeeId: this.user._id,
            payslipDate: payslipDate
        }).subscribe(data => {
            if (!data) {
                this.failure('Payslip does not exist for the employee for the month selected');
            } else {
                this.downloadService.exportAsPdf(`payslip-${this.displayName(this.user)}-${payslipDate}`, jspdf => this.salaryService.generatePayslip(jspdf, this.user, data));
            }
            this.hideProgress();
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
