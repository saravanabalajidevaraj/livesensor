import { Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import {
    AlertService, ReportService, SiteService, UserService, ImageService, AttendanceService, DownloadService, UtilService
} from '../../../_services';
import { User, AttendanceReport, Deployment } from '../../../_models';

@Component({
    selector: 'app-ar-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css']
})
export class AReportComponent extends ReportComponent<AttendanceReport> {
    @Input() deployments: Array<Deployment>;
    @Input() holiday: string;

    private fields: Array<string> = ['startTime', 'breakTime', 'resumeTime', 'endTime'];

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected attendanceService: AttendanceService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    editDate(field: string, value: string) {
        if (this.report[field]) {
            this.report[field] = this.considerTimezone(`${value}T${this.time(field)}:00.000Z`);
        } else {
            this.report[field] = this.considerTimezone(`${value}T00:00:00.000Z`);
        }
    }

    editTime(field: string, value: string) {
        if (this.report[field]) {
            this.report[field] = this.considerTimezone(`${this.date(field)}T${value}:00.000Z`);
        } else {
            const date = this.fields.map(a => this.date(a)).find(a => !!a);
            this.report[field] = this.considerTimezone(`${date}T${value}:00.000Z`);
        }
    }

    date(field: string) {
        return this.report[field] && this.clientDate(this.report[field]) || '';
    }

    time(field: string) {
        return this.report[field] && this.clientTime(this.report[field]) || '';
    }

    exportAsPdf() {
        const images = [];
        if (this.report.startImage) {
            images.push(this.report.startImage.id);
        }
        if (this.report.endImage) {
            images.push(this.report.endImage.id);
        }

        if (images.length) {
            this.showProgress();
            Observable.forkJoin([
                ...images.map(a => this.imageService.imageString(a))
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

    protected pdfFormatter(jspdf: jsPDF, report: AttendanceReport, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'Site:');
        jspdf.text(70, start + 20, this.siteName(report.siteId));

        jspdf.text(20, start + 30, 'User:');
        jspdf.text(70, start + 30, this.userName(report.userId));

        jspdf.text(20, start + 40, 'Role:');
        jspdf.text(70, start + 40, this.userRole(report.userId));

        jspdf.text(20, start + 50, 'Duty:');
        jspdf.text(70, start + 50, this.userDuty(report.siteId, report.userId));

        jspdf.text(20, start + 60, 'Start Work:');
        jspdf.text(70, start + 60, report.startTime && this.parseDateTime(report.startTime) || 'N/A');

        jspdf.text(20, start + 70, 'Start Break:');
        jspdf.text(70, start + 70, report.breakTime && this.parseDateTime(report.breakTime) || 'N/A');

        jspdf.text(20, start + 80, 'Resume Work:');
        jspdf.text(70, start + 80, report.resumeTime && this.parseDateTime(report.resumeTime) || 'N/A');

        jspdf.text(20, start + 90, 'End Work:');
        jspdf.text(70, start + 90, report.endTime && this.parseDateTime(report.endTime) || 'N/A');

        if (images.length) {
            let head = 100, padding = 20, width = 0;
            const imageHeight = 90, imageWidth = 60;

            if (start + head + 10 + imageHeight > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
                start = 0;
            }
            jspdf.text(20, start + head, 'Images:');
            head += 10;

            images.forEach((a, i) => {
                if (padding * 2 + width + imageWidth > jspdf.internal.pageSize.width) {
                    width = 0;
                    head += imageHeight + padding;
                }

                if (start + head + imageHeight > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                    start = 0;
                }
                jspdf.addImage(a, 'JPEG', padding + width, start + head, imageWidth, imageHeight);
                width += imageWidth + padding / 2;
            });
        }
    }

    userRole(userId: string) {
        const user: User = this.users.get(userId);
        return user && user.role || 'N/A';
    }

    userDuty(siteId: string, userId: string) {
        const deployment = this.deployments.find(a => a.siteId === siteId);
        if (!deployment) return 'N/A';
        const detail = [
            ...deployment.amShiftDeployment.officers,
            ...deployment.pmShiftDeployment.officers
        ].find(officer => officer.id === userId);
        return detail && detail.description || 'N/A';
    }

    private parseDateTime(dateTime: string) {
        return this.pipe.transform(dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(dateTime, 'HH:mm')
    }

    protected rightHeadingLabel() {
        return this.holiday || '';
    }

    protected fileName() {
        return 'attendance-report';
    }

    submit() {
        const {
            _id, startTime, breakTime, resumeTime, endTime, siteId, employeeId
        } = this.report;

        this.showProgress();
        this.attendanceService.update({
            _id, startTime, breakTime, resumeTime, endTime, siteId, employeeId
        }).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.back();
                this.triggerRefresh.emit();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
