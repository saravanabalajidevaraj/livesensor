import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { SearchComponent } from '../base-report/search/search.component';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, DownloadService, SalaryService
} from '../../_services';
import { SalaryReport } from '../../_models';

@Component({
    selector: 'app-salary',
    templateUrl: './salary-report.component.html'
})
export class SRComponent extends SearchComponent<SalaryReport> {
    public monthError: string = '';
    public yearError: string = '';

    private minYear: number = 2019;
    public years = new Array(new Date().getFullYear() - this.minYear + 1).fill(this.minYear).map((a, i) => a + i);
    public months: Array<string> = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected salarySalary: SalaryService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    validateSelection(month: string, year: string) {
        this.monthError = '';
        this.yearError = '';
        const FIELD_REQUIRED = 'Select a valid value';

        if (!month || Number(month) > this.months.length) {
            this.monthError = FIELD_REQUIRED;
            return false;
        }

        if (!year || Number(year) > this.years.length) {
            this.yearError = FIELD_REQUIRED;
            return false;
        }

        return true;
    }

    fetchReports(month: string, year: string) {
        if (!this.validateSelection(month, year)) return;

        this.reports = [];
        this.showProgress();
        this.reportService.getReports<SalaryReport>('/paySlip/report', {
            payslipDate: `${month}-${this.years[Number(year) - 1]}`
        }).subscribe(data => {
            this.hideProgress();
            this.reports = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    generate(salary: any) {
        this.downloadService.exportAsPdf(`payslip-${salary.payslipDate}`, jspdf => this.salarySalary.generatePayslip(jspdf, this.users.get(salary.employeeId), salary));
    }
}
