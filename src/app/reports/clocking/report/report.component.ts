import { Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import {
    AlertService, ReportService, SiteService, UserService, ImageService, UtilService, ClockingService, DownloadService
} from '../../../_services';
import { ClockingReport, ClockingResult, ClockingPoint } from '../../../_models';

@Component({
    selector: 'app-cl-report',
    templateUrl: './report.component.html'
})
export class CLReportComponent extends ReportComponent<ClockingReport> {
    @Input() points: Map<string, ClockingPoint>;
    @Input() clockingData: Map<string, ClockingResult>;

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected clockingService: ClockingService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    exportAsPdf() {
        const images = this.report.logs.map(a => a.images).reduce((acc, a) => [...acc, ...a], []);
        if (images.length) {
            this.showProgress();
            Observable.forkJoin([
                ...images.map(a => this.imageService.imageString(a.id))
            ]).subscribe(data => {
                this.hideProgress();
                this.exportPdf(data);
            }, data => {
                this.hideProgress();
                this.failure(data);
            });
        } else {
            this.exportPdf([]);
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: ClockingReport, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(50, start + 20, report.date);

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(50, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Points:');
        jspdf.text(50, start + 40, String(this.points.size));

        jspdf.text(20, start + 50, 'Plan Time:');
        jspdf.text(50, start + 50, report.planTime);

        const array = Array.from(new Set(this.report.logs.map(a => a.clockingData.map(b => b.qrId)).reduce((acc, a) => [...acc, ...a], [])));
        jspdf.text(20, start + 60, 'Details:');

        let pullBack = 0, skipAhead = 0, head = 70, imageIndex = 0, width = 0, padding = 20;
        const imageHeight = 90, imageWidth = 60;
        array.forEach((a, i) => {
            const clockingTime = this.parseTime(this.clockingTime(a));

            const reason = this.reason(a);
            const reasonLines = jspdf.splitTextToSize(`Reason: ${reason}`, jspdf.internal.pageSize.width - 61);

            const remark = this.remarks(a);
            const remarkLines = jspdf.splitTextToSize(`Remark: ${remark}`, jspdf.internal.pageSize.width - 61);

            if (start + head + 30 + (reason ? imageHeight : 0) + (i - pullBack) * 10 + (skipAhead + reasonLines.length + remarkLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
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
            jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, this.user(a));

            if (reason) {
                head += 10;
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, reasonLines);
                skipAhead += reasonLines.length - 1;

                head += 10;
                jspdf.addImage(images[imageIndex++], 'JPEG', 20 + padding + width, start + head + (i - pullBack) * 10 + skipAhead * 6.5, imageWidth, imageHeight);
                head += imageHeight;
            }

            if (remark) {
                head += 10;
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, remarkLines);
                skipAhead += remarkLines.length - 1;
            }
        });
    }

    protected fileName() {
        return 'clocking';
    }

    user(qrId: string) {
        return this.userName(this.report.logs.find(a => a.clockingData.some(b => b.qrId === qrId)).userId);
    }

    pointName(qrId: string) {
        return this.points.get(qrId).qrData.contents.split(':').slice(3).map(a => a.trim()).join(':');
    }

    clockingResult(qrId: string): ClockingResult {
        return this.clockingData.get(qrId);
    }

    imageId(qrId: string) {
        const result = this.clockingResult(qrId);
        const log = this.report.logs.find(a => a.clockingData.includes(result));
        return log.images[result.imageIndex].id;
    }

    clockingTime(qrId: string) {
        return this.clockingResult(qrId).dateTime;
    }

    reason(qrId: string) {
        return this.clockingResult(qrId).reason || '';
    }

    remarks(qrId: string) {
        return this.clockingResult(qrId).remarks || '';
    }

    private parseTime(dateTime: string) {
        if (!dateTime) return dateTime;
        return this.pipe.transform(dateTime, 'dd/MM/yyyy') + ' ' +
            this.pipe.transform(dateTime, 'HH:mm')
    }

    date(qrId: string) {
        return this.clientDate(this.clockingTime(qrId));
    }

    time(qrId: string) {
        return this.clientTime(this.clockingTime(qrId));
    }

    updateDate(qrId: string, value: string) {
        const result: ClockingResult = this.clockingResult(qrId);
        result.dateTime = this.considerTimezone(`${value}T${this.time(qrId)}:00.000Z`);
    }

    updateTime(qrId: string, value: string) {
        const result: ClockingResult = this.clockingResult(qrId);
        result.dateTime = this.considerTimezone(`${this.date(qrId)}T${value}:00.000Z`);
    }

    submit() {
        this.showProgress();
        Observable.forkJoin(this.report.logs.map(log => {
            const { _id, clockingData } = log;
            return this.reportService.updateReport(this.url + '/update', { _id, clockingData });
        })).subscribe(data => {
            this.hideProgress();
            if (data.every(a => a.success)) {
                this.success(data[0].description);
                this.back();
                this.triggerRefresh.emit();
            } else {
                this.failure('Request Failed');
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
