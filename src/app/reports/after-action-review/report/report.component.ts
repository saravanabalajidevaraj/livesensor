import { Component } from '@angular/core';
import * as jsPDF from 'jspdf';

import { User } from '../../../_models';
import { ReportComponent } from '../../base-report/report/report.component';
import { AfterActionReview } from '../../../_models';

@Component({
    selector: 'app-aar-report',
    templateUrl: './report.component.html'
})
export class AARReportComponent extends ReportComponent<AfterActionReview> {

    protected pdfFormatter(jspdf: jsPDF, report: AfterActionReview, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Reported By:');
        jspdf.text(70, start + 40, this.userName(report.reportedBy));

        jspdf.text(20, start + 50, 'Incident Type:');
        jspdf.text(70, start + 50, report.incidentType);

        jspdf.text(20, start + 60, 'Assignment Name:');
        jspdf.text(70, start + 60, report.assignmentName);

        jspdf.text(20, start + 70, 'Location:');
        jspdf.text(70, start + 70, report.location);
        let head = 80;

        const descLines = jspdf.splitTextToSize(report.incidentDescription, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (descLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Description:');
        jspdf.text(40, start + head + 10, descLines);
        let skipAhead = descLines.length - 1;
        head += 20;

        const actionLines = jspdf.splitTextToSize(report.companyActions, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + actionLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Action taken:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, actionLines);
        skipAhead += actionLines.length - 1;
        head += 20;

        if (start + head + 20 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }
        const array = report.personalsInvolved;
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Personal(s) Involved:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                if (start + head + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, this.userName(a));
            });
            head += (array.length - pullBack) * 10;
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        if (start + head + 60 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'For Official Use Only');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Approved By');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Name:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Designation:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Time:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
    }

    protected fileName() {
        return 'after-action-review';
    }

    updateDate(value: string) {
        this.report.dateTime = this.considerTimezone(`${value}T${this.clientTime(this.report.dateTime)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.dateTime = this.considerTimezone(`${this.clientDate(this.report.dateTime)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, incidentType, assignmentName, location, dateTime,
            reportedBy, incidentDescription, personalsInvolved, companyActions
        } = this.report;

        this.updateReport({
            _id, siteId, incidentType, assignmentName, location, dateTime,
            reportedBy, incidentDescription, personalsInvolved, companyActions
        });
    }
}
