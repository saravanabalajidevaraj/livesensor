import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { OfficerFeedback } from '../../../_models';

@Component({
    selector: 'app-of-search',
    templateUrl: './search.component.html'
})
export class OFSearchComponent extends SearchComponent<OfficerFeedback> {

    validate(from: Date, to: Date, payload: any) {
        this.timeError = '';

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        return true;
    }

    protected excelFormatter(worksheet: WorkSheet, report: OfficerFeedback, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Officer', this.userName(report.userId)],
            ['Date', this.pipe.transform(report.dateCreated, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateCreated, 'HH:mm')],
            ['Contact No', report.contactNo],
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

    exportAsPdf() {
        this.downloadService.exportAsPdf(this.fileName(), jspdf => {
            let head = 10;
            const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
            jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, head, imageWidth, imageHeight);
            head += imageHeight + 10;

            const heading = this.reportName();
            jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, head, heading);
            head += 20;

            this.reports.forEach(report => {
                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }

                jspdf.text(20, head, 'DateTime:');
                jspdf.text(70, head, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy') +
                    ' ' + this.pipe.transform(report.dateCreated, 'HH:mm'));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }

                jspdf.text(20, head, 'Site:');
                jspdf.text(70, head, this.siteName(report.siteId));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }

                jspdf.text(20, head, 'Officer:');
                jspdf.text(70, head, this.userName(report.userId));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Contact No:');
                jspdf.text(70, head, report.contactNo);
                head += 10;

                const commentLines = jspdf.splitTextToSize(report.comments, jspdf.internal.pageSize.width - 61);
                if (head + 20 + (commentLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Comments:');
                jspdf.text(40, head + 10, commentLines);
                head += 20 + (commentLines.length - 1) * 6.5

                jspdf.line(20, head, jspdf.internal.pageSize.width - 20, head);

                head += 10;
            });
        });
    }

    protected fileName() {
        return 'officer-feedback';
    }
}
