import { Component } from '@angular/core';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { ClientSatisfaction } from '../../../_models';

@Component({
    selector: 'app-cs-report',
    templateUrl: './report.component.html'
})
export class CSReportComponent extends ReportComponent<ClientSatisfaction> {

    protected pdfFormatter(jspdf: jsPDF, report: ClientSatisfaction, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateCreated, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        const comments = report.comments;
        let head = 50, skipAhead = 0;
        if (comments.length) {
            jspdf.text(20, start + head, 'Comments:');
            head += 10;

            let pullBack = 0;
            comments.forEach((a, i) => {
                const commentLines = jspdf.splitTextToSize(a, jspdf.internal.pageSize.width - 61);
                if (start + head + (i - pullBack) * 10 + (skipAhead + commentLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    pullBack = i;
                    start = 0;
                    head = 20;
                }
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, commentLines);
                skipAhead += commentLines.length - 1;
            });
            head += (comments.length - pullBack) * 10;
        }

        const array = report.itemData || [];
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const itemLines = jspdf.splitTextToSize(a.item, jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 71);
                const noteLines = jspdf.splitTextToSize(a.note || '', jspdf.internal.pageSize.width - 61);
                if (start + head + 20 + (i - pullBack) * 10 + (skipAhead + itemLines.length + noteLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, itemLines);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.selection);
                skipAhead += itemLines.length - 1;

                if (a.note) {
                    jspdf.text(40, start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5, noteLines);
                    skipAhead += noteLines.length - 1;
                    head += 10;
                }
            });
            head += (array.length - pullBack) * 10
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        if (start + head + 60 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'PARTICULARS OF REPORTING ORGANIZATION');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Reporter:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientName);
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Designation:');
        jspdf.text(70, start + head + skipAhead * 6.5, report.clientDesignation || '');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Office Tel:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'E-Mail Address:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.72, start + head + skipAhead * 6.5, 'Date:');
    }

    protected fileName() {
        return 'client-satisfaction';
    }
}
