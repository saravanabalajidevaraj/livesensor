import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { SiteVisit } from '../../../_models';

@Component({
    selector: 'app-sv-search',
    templateUrl: './search.component.html'
})
export class SVSearchComponent extends SearchComponent<SiteVisit> {

    protected excelFormatter(worksheet: WorkSheet, report: SiteVisit, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Conducted By', this.userName(report.visitedUserId),],
            ['Date', this.pipe.transform(report.timeIn, 'dd/MM/yyyy')],
            ['Time In', this.pipe.transform(report.timeIn, 'dd/MM/yyyy')],
            ['Time Out', this.pipe.transform(report.timeOut, 'dd/MM/yyyy')]
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
                jspdf.text(70, head, this.pipe.transform(report.timeIn, 'dd/MM/yyyy') +
                    ' ' + this.pipe.transform(report.timeIn, 'HH:mm') +
                    ' - ' + this.pipe.transform(report.timeOut, 'HH:mm'));
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
                jspdf.text(20, head, 'Conducted By:');
                jspdf.text(70, head, this.userName(report.visitedUserId));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.line(20, head, jspdf.internal.pageSize.width - 20, head);
                head += 10;
            });
        });
    }

    protected fileName() {
        return 'site-visit';
    }
}
