import { Component, EventEmitter, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, ClockingService, DownloadService
} from '../../../_services';
import { ClockingReport, ClockingPoint, ClockingLog, ClockingResult } from '../../../_models';

class ClockingRow {
    r: ClockingReport;
    p: string;
    i: number;
    j: number;
}

@Component({
    selector: 'app-cl-search',
    templateUrl: './search.component.html',
})
export class CLSearchComponent extends SearchComponent<ClockingReport> {
    @Output() sitePoints = new EventEmitter<Map<string, ClockingPoint>>();

    public rows: Array<ClockingRow> = [];
    public points: Map<string, ClockingPoint>;

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected clockingService: ClockingService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    protected excelFormatter(worksheet: WorkSheet, report: ClockingReport, index: number) {
        const points = Array.from(this.points).map(a => a[0]);

        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Points', this.points.size],
            ['Date', report.date],
            ['Plan Time', report.planTime]
        ];

        const range = worksheet['!ref'].split(':');
        let start = range.length === 1 ? 0 : Number(range[1].slice(1));
        let endColumn = range.length === 1 ? 'B' : range[1][0];

        points.forEach((a, i) => {
            const entry = [this.pointName(a), this.clockingTime(report, a), this.user(report, a)];
            endColumn = 'C';

            const reason = this.reason(report, a);
            const remark = this.remarks(report, a);

            if (reason || remark) {
                entry.push(reason ? `Reason: ${reason}` : '');
                entry.push(remark ? `Remarks: ${remark}` : '');

                endColumn = 'E';
            }

            values.push(entry);
        });

        if (index < this.reports.length - 1) values.push(['', '']);

        let end = start;
        values.forEach((a, i) => {
            worksheet[`A${++end}`] = {t: 's', v: String(a[0])};
            worksheet[`B${end}`] = {t: 's', v: String(a[1])};
            if (a[2]) worksheet[`C${end}`] = {t: 's', v: String(a[2])};
            if (a[3]) worksheet[`D${end}`] = {t: 's', v: String(a[3])};
            if (a[4]) worksheet[`E${end}`] = {t: 's', v: String(a[4])};
        });

        worksheet['!ref'] = `A1:${endColumn}${end}`;
        worksheet['!merges'] = worksheet['!merges'] || [];
    }

    protected pdfFormatter(jspdf: jsPDF, report: ClockingReport, index: number, start: number) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(50, start + 20, report.date);

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(50, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Points:');
        jspdf.text(50, start + 40, String(this.points.size));

        jspdf.text(20, start + 50, 'Plan Time:');
        jspdf.text(50, start + 50, report.planTime);

        const array = Array.from(this.points).map(a => a[0]);
        if (array.length) {
            jspdf.text(20, start + 60, 'Details:');

            let pullBack = 0, skipAhead = 0, head = 70;
            array.forEach((a, i) => {
                const clockingTime = this.clockingTime(report, a);

                const reason = this.reason(report, a);
                const reasonLines = jspdf.splitTextToSize(`Reason: ${reason}`, jspdf.internal.pageSize.width - 61);

                const remark = this.remarks(report, a);
                const remarkLines = jspdf.splitTextToSize(`Remark: ${remark}`, jspdf.internal.pageSize.width - 61);

                if (start + head + 30 + (i - pullBack) * 10 + (skipAhead + reasonLines.length + remarkLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, this.pointName(a));

                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(clockingTime) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, clockingTime);

                head += 10;
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, this.user(report, a));

                if (reason) {
                    head += 10;
                    jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, reasonLines);
                    skipAhead += reasonLines.length - 1;
                }

                if (remark) {
                    head += 10;
                    jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, remarkLines);
                    skipAhead += remarkLines.length - 1;
                }
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'clocking';
    }

    fetchReports(from: string, to: string, payload: any) {
        const fromDate = new Date(from);

        const toDate: Date = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        if (!this.validate(fromDate, toDate, payload)) return;

        payload.fromDate = fromDate.toISOString();
        payload.toDate = toDate.toISOString();

        this.points = undefined;
        this.reports = [];
        this.rows = [];

        this.showProgress();
        Observable.forkJoin([
            this.clockingService.getPointsBySite(payload.siteId),
            this.clockingService.getReports(payload)
        ]).subscribe(data => {
            this.hideProgress();
            this.points = data[0];
            this.reports = data[1];
            this.rows = this.reports
                .map((a, i) => Array.from(this.points).map((b, j) => ({p: b[0], r: a, i, j})))
                .reduce((acc, a) => [...acc, ...a], [])
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    user(report: ClockingReport, qrId: string) {
        const log: ClockingLog = this.clockingLog(report, qrId);
        return log && this.userName(log.userId) || 'N/A';
    }

    pointName(qrId: string) {
        return this.points.get(qrId).qrData.contents.split(':').slice(3).map(a => a.trim()).join(':');
    }

    private clockingLog(report: ClockingReport, qrId: string): ClockingLog {
        return report.logs.find(a => a.clockingData.some(b => b.qrId === qrId));
    }

    private clockingResult(report: ClockingReport, qrId: string): ClockingResult {
        return report.logs.map(a => a.clockingData).reduce((acc, a) => [...acc, ...a], []).find(b => b.qrId === qrId);
    }

    issue(report: ClockingReport, qrId: string) {
        const result: ClockingResult = this.clockingResult(report, qrId);
        return result ? result.scanned ? '' : 'Barcode Issue' : 'Missing';
    }

    clockingTime(report: ClockingReport, qrId: string) {
        const result: ClockingResult = this.clockingResult(report, qrId);
        return result && result.dateTime ? this.parseTime(result.dateTime) : '';
    }

    private parseTime(dateTime: string) {
        if (!dateTime) return dateTime;
        return this.pipe.transform(dateTime, 'dd/MM/yyyy') + ' ' +
            this.pipe.transform(dateTime, 'HH:mm')
    }

    reason(report: ClockingReport, qrId: string) {
        const result: ClockingResult = this.clockingResult(report, qrId);
        return result && result.reason || '';
    }

    remarks(report: ClockingReport, qrId: string) {
        const result: ClockingResult = this.clockingResult(report, qrId);
        return result && result.remarks || '';
    }

    openReport(report: ClockingReport, isEdit: boolean) {
        super.openReport(report, isEdit);
        this.sitePoints.emit(this.points);
    }
}
