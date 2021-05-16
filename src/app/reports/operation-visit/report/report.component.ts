import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { OperationVisit, User } from '../../../_models';

@Component({
    selector: 'app-ov-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css']
})
export class OVReportComponent extends ReportComponent<OperationVisit> {

    exportAsPdf() {
        const images = this.report.images
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

    protected pdfFormatter(jspdf: jsPDF, report: OperationVisit, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.visitDate, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.visitDate, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Conducted By:');
        jspdf.text(70, start + 40, this.userName(report.conductedBy));

        jspdf.text(20, start + 50, 'Performance:');
        jspdf.text(70, start + 50, report.overallPerformance);

        let head = 60;
        const feedLines = jspdf.splitTextToSize(report.feedbackFromSiteOfficer, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (feedLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Site Officer Feedback:');
        jspdf.text(40, start + head + 10, feedLines);
        let skipAhead = feedLines.length - 1;
        head += 20;

        const commLines = jspdf.splitTextToSize(report.commentsRecommendations, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + commLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Comments / Recommendations:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, commLines);
        skipAhead += commLines.length - 1;
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Client Name:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientName);
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Client Designation:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientDesignation);
        head += 10;

        const officers = report.securityOfficers;
        if (officers.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Security Officers:');
            head += 10

            let pullBack = 0;
            officers.forEach((a, i) => {
                if (start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, this.userName(a));
            });
            head += (officers.length - pullBack) * 10;
        }

        if (start + head + 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        const ratings = report.officerRatings.data;
        if (ratings.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Points:');
            head += 10;

            let pullBack = 0;
            ratings.forEach((a, i) => {
                if (start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.criteria);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(String(a.point)) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, String(a.point));
            });
            head += (ratings.length - pullBack) * 10;
        }

        head += 10;
        if (start + head + 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        const duties = report.officerDuties.data;
        if (duties.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Duties:');
            head += 10;

            let pullBack = 0;
            duties.forEach((a, i) => {
                if (start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                const response = a.response ? 'Yes' : 'No';
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.criteria);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(response) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, response);
            });
            head += (duties.length - pullBack) * 10;
        }

        if (images.length) {
            let width = 0;
            const imageHeight = 90, imageWidth = 60, padding = 20;

            if (start + head + 10 + skipAhead * 6.5 + imageHeight > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
                start = 0;
                skipAhead = 0;
            }
            jspdf.text(20, start + head + skipAhead * 6.5, 'Images:');
            head += 10;

            images.forEach((a, i) => {
                if (padding * 2 + width + imageWidth > jspdf.internal.pageSize.width) {
                    width = 0;
                    head += imageHeight + padding;
                }

                if (start + head + skipAhead * 6.5 + imageHeight > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                    start = 0;
                    skipAhead = 0;
                }
                jspdf.addImage(a, 'JPEG', padding + width, start + head + skipAhead * 6.5, imageWidth, imageHeight);
                width += imageWidth + padding / 2;
            });
            head += imageHeight + 10;
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        if (start + head + 180 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'SO Signatures:');
        head += 10;

        new Array(5).fill(0).forEach((a, i) => {
            jspdf.text(20, start + head + i * 10 + skipAhead * 6.5, (i + 1) + '. SO:');
            jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + i * 10 + skipAhead * 6.5, 'Date:');
        });
        head += 60;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Patrol Officer:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.conductedBy));
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Live Sensor Management Acknowledgement');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Name:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Designation:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Submission to Client');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Name:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientName);
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Designation:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientDesignation);
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.visitDate, 'dd/MM/yyyy'));
    }

    protected fileName() {
        return 'operation-visit';
    }

    updateDate(value: string) {
        this.report.visitDate = this.considerTimezone(`${value}T${this.clientTime(this.report.visitDate)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.visitDate = this.considerTimezone(`${this.clientDate(this.report.visitDate)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, conductedBy, visitDate, overallPerformance,
            feedbackFromSiteOfficer, commentsRecommendations, clientName,
            clientDesignation, securityOfficers, officerRatings, officerDuties
        } = this.report;

        this.updateReport({
            _id, siteId, conductedBy, visitDate, overallPerformance,
            feedbackFromSiteOfficer, commentsRecommendations, clientName,
            clientDesignation, securityOfficers, officerRatings, officerDuties
        });
    }
}
