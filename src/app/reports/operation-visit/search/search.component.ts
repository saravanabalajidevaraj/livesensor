import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { OperationVisit } from '../../../_models';

@Component({
    selector: 'app-ov-search',
    templateUrl: './search.component.html'
})
export class OVSearchComponent extends SearchComponent<OperationVisit> {

    protected excelFormatter(worksheet: WorkSheet, report: OperationVisit, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Date', this.pipe.transform(report.visitDate, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.visitDate, 'HH:mm')],
            ['Conducted By', this.userName(report.conductedBy)],

            ...report.securityOfficers.map((a, i) => [i ? undefined : 'Security Officers', this.userName(a)]),

            ...report.officerRatings.data.map(a => [a.criteria, a.point]),

            ...report.officerDuties.data.map(a => [a.criteria, a.response ? 'Yes' : 'No']),

            ['Overall Performance', report.overallPerformance],
            ['Site Officer Feedback', report.feedbackFromSiteOfficer],
            ['Comments / Recommendations', report.commentsRecommendations],
            ['Client Name', report.clientName],
            ['Client Designation', report.clientDesignation]
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

        start += 5;

        if (report.securityOfficers.length) {
            worksheet['!merges'].push({ s: { r: start, c: 0 }, e: { r: start + report.securityOfficers.length - 1, c: 0 } });
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: OperationVisit, index: number, start: number) {
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
            head += officers.length * 10;
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
            head += ratings.length * 10;
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
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'operation-visit';
    }
}
