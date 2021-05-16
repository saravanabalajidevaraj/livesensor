import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { AfterActionReview } from '../../../_models';

@Component({
    selector: 'app-aar-search',
    templateUrl: './search.component.html'
})
export class AARSearchComponent extends SearchComponent<AfterActionReview> {

    protected excelFormatter(worksheet: WorkSheet, report: AfterActionReview, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Incident Type', report.incidentType],
            ['Assignment Name', report.assignmentName],
            ['Location', report.location],
            ['Date', this.pipe.transform(report.dateTime, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateTime, 'HH:mm')],
            ['Reported By', this.userName(report.reportedBy)],
            ['Description', report.incidentDescription],
            ['Action taken', report.companyActions],

            ...report.personalsInvolved.map((a, i) => [i ? undefined : 'Personal(s) Involved', this.userName(a)])
        ];

        if (index < this.reports.length - 1) values.push(['', '']);

        const range = worksheet['!ref'].split(':');
        let start = range.length === 1 ? 0 : Number(range[1].slice(1));
        let end = start;
        values.forEach((a, i) => {
            worksheet[`A${++end}`] = {t: 's', v: String(a[0])};
            worksheet[`B${end}`] = {t: 's', v: String(a[1])};
        });

        worksheet['!ref'] = `A1:B${end}`;
        worksheet['!merges'] = worksheet['!merges'] || [];

        start += 10;

        if (report.personalsInvolved.length) {
            worksheet['!merges'].push({ s: { r: start, c: 0 }, e: { r: start + report.personalsInvolved.length - 1, c: 0 } });
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: AfterActionReview, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20,  this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
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

        const descLines = jspdf.splitTextToSize(report.incidentDescription, jspdf.internal.pageSize.width - 61);
        jspdf.text(20, start + 80, 'Description:');
        jspdf.text(40, start + 90, descLines);
        let skipAhead = descLines.length - 1;

        const actionLines = jspdf.splitTextToSize(report.companyActions, jspdf.internal.pageSize.width - 61);
        jspdf.text(20, start + 100 + skipAhead * 6.5, 'Action taken:');
        jspdf.text(40, start + 110 + skipAhead * 6.5, actionLines);
        skipAhead += actionLines.length - 1;

        const array = report.personalsInvolved;
        if (array.length) {
            jspdf.text(20, start + 120 + skipAhead * 6.5, 'Personal(s) Involved:');

            let pullBack = 0, head = 130;
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
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'after-action-review';
    }
}
