import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import { IncidentReport, Designation } from '../../../_models';

@Component({
    selector: 'app-ir-report',
    templateUrl: './report.component.html'
})
export class IRReportComponent extends ReportComponent<IncidentReport> {

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

    protected pdfFormatter(jspdf: jsPDF, report: IncidentReport, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.incidentDate, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.incidentDate, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Report No:');
        jspdf.text(70, start + 50, report.reportNo);

        jspdf.text(20, start + 60, 'Location:');
        jspdf.text(70, start + 60, report.location);

        jspdf.text(20, start + 70, 'Subject:');
        jspdf.text(70, start + 70, report.subject);
        let head = 80;

        const descLines = jspdf.splitTextToSize(report.incidentDescription, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (descLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Description:');
        jspdf.text(40, start + head + 10, descLines);
        let skipAhead = descLines.length - 1;
        head += 20;

        const actionLines = jspdf.splitTextToSize(report.followUpActionTaken, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (skipAhead + actionLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Follow up actions:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, actionLines);
        skipAhead += actionLines.length - 1;
        head += 20;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Victim Name:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.victimParticulars.name);
        head += 10;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Victim Sex:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.victimParticulars.sex);
        head += 10;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Victim No:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.victimParticulars.victimNo);
        head += 10;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Victim Address:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.victimParticulars.address);
        head += 10;

        if (images.length) {
            let width = 0;
            const imageHeight = 90, imageWidth = 60, padding = 20;

            if (start + head + skipAhead * 6.5 + imageHeight > jspdf.internal.pageSize.height) {
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

        if (start + head + 90 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'Reported By');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Officer Name:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.userId));
        head += 10;

        const user = this.users.get(report.userId);
        jspdf.text(20, start + head + skipAhead * 6.5, 'Designation:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.designations.find(a => a.code === user.role).description);
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'FOR OFFICIAL USE ONLY');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Management:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Name:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
    }

    protected fileName() {
        return 'incident-report';
    }

    updateDate(value: string) {
        this.report.incidentDate = this.considerTimezone(`${value}T${this.clientTime(this.report.incidentDate)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.incidentDate = this.considerTimezone(`${this.clientDate(this.report.incidentDate)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, reportNo, location, incidentDate, subject,
            victimParticulars, incidentDescription, followUpActionTaken
        } = this.report;

        this.updateReport({
            _id, siteId, reportNo, location, incidentDate, subject,
            victimParticulars, incidentDescription, followUpActionTaken
        });
    }
}
