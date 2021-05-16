import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, VacationService, DownloadService
} from '../../../_services';
import { VacationReport } from '../../../_models';

@Component({
    selector: 'app-vr-search',
    templateUrl: './search.component.html'
})
export class VSearchComponent extends SearchComponent<VacationReport> {
    private vacationTypes: Map<string, string> = new Map<string, string>();

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected vacationService: VacationService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.vacationService.vacationTypes().subscribe(data => {
            this.vacationTypes = data.reduce((acc, type) => {
                acc.set(type.code, type.description);
                return acc;
            }, new Map<string, string>())
        })
    }

    validate(from: Date, to: Date) {
        this.timeError = '';

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        return true;
    }

    fetchReports(from: string, to: string, userId: string) {
        const fromDate = new Date(from);

        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        if (!this.validate(fromDate, toDate)) return;

        const payload: any = {};
        if (userId !== '') payload.employeeId = userId;
        payload.fromDate = fromDate.toISOString();
        payload.toDate = toDate.toISOString();

        this.reports = [];
        this.showProgress();
        this.reportService.getReports<VacationReport>(this.url + '/report', payload).subscribe(data => {
            this.reports = data;
            this.hideProgress();
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    vacationType(type: string) {
        return this.vacationTypes.get(type) || 'N/A';
    }

    protected excelFormatter(worksheet: WorkSheet, report: VacationReport, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Employee', this.userName(report.employeeId)],
            ['Reviewer', this.userName(report.approverId)],
            ['Status', report.status || 'PENDING'],
            ['Action On', this.pipe.transform(report.dateCreated, 'dd/MM/yyyy')],
            ['Type', this.vacationType(report.leaveTypeCode)],
            ['From', this.pipe.transform(report.fromDate, 'dd/MM/yyyy')],
            ['To', this.pipe.transform(report.toDate, 'dd/MM/yyyy')],
            ['Duration', report.duration],
            ['Comments', report.comments]
        ];

        const range = worksheet['!ref'].split(':');
        let start = range.length === 1 ? 0 : Number(range[1].slice(1));
        let endColumn = range.length === 1 ? 'B' : range[1][0];

        if (index < this.reports.length - 1) values.push(['', '']);

        let end = start;
        values.forEach((a, i) => {
            worksheet[`A${++end}`] = {t: 's', v: String(a[0])};
            worksheet[`B${end}`] = {t: 's', v: String(a[1])};
        });

        worksheet['!ref'] = `A1:${endColumn}${end}`;
        worksheet['!merges'] = worksheet['!merges'] || [];
    }

    protected pdfFormatter(jspdf: jsPDF, report: VacationReport, index: number, start: number) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));

        jspdf.text(20, start + 30, 'Employee:');
        jspdf.text(70, start + 30, this.userName(report.employeeId));

        jspdf.text(20, start + 40, 'Reviewer:');
        jspdf.text(70, start + 40, this.userName(report.approverId));

        jspdf.text(20, start + 50, 'Status:');
        jspdf.text(70, start + 50, report.status || 'PENDING');

        jspdf.text(20, start + 60, 'Type:');
        jspdf.text(70, start + 60, this.vacationType(report.leaveTypeCode));

        jspdf.text(20, start + 70, 'Date Range:');
        jspdf.text(70, start + 70, this.pipe.transform(report.fromDate, 'dd/MM/yyyy') +
            ' - ' + this.pipe.transform(report.toDate, 'dd/MM/yyyy'));

        jspdf.text(20, start + 80, 'Duration:');
        jspdf.text(70, start + 80, String(report.duration));

        let head = 90;
        const commentLines = jspdf.splitTextToSize(report.comments, jspdf.internal.pageSize.width - 61);
        if (start + head + (commentLines - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Comments:');
        jspdf.text(40, start + head + 10, commentLines);

        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'vacation-report';
    }
}
