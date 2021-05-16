import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { DailyChecklist } from '../../../_models';

@Component({
    selector: 'app-dc-search',
    templateUrl: './search.component.html'
})
export class DCSearchComponent extends SearchComponent<DailyChecklist> {

    protected excelFormatter(worksheet: WorkSheet, report: DailyChecklist, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['User', this.userName(report.userId)],
            ['Date', this.pipe.transform(report.dateCreated, 'dd/MM/yyyy')],
            ['Hand Over to', this.userName(report.handOverTo)],

            ...report.dailyCheckList.data.map(a => [a.question, a.quantity, a.remarks || ''])
        ];

        const range = worksheet['!ref'].split(':');
        let start = range.length === 1 ? 0 : Number(range[1].slice(1));
        let endColumn = range.length === 1 ? 'B' : range[1][0];

        if (index < this.reports.length - 1) values.push(['', '']);

        let end = start;
        values.forEach((a, i) => {
            worksheet[`A${++end}`] = {t: 's', v: String(a[0])};
            worksheet[`B${end}`] = {t: 's', v: String(a[1])};
            if (a[2]) {
                worksheet[`C${end}`] = {t: 's', v: String(a[2])};
                endColumn = 'C';
            }
        });

        worksheet['!ref'] = `A1:${endColumn}${end}`;
        worksheet['!merges'] = worksheet['!merges'] || [];
    }

    protected pdfFormatter(jspdf: jsPDF, report: DailyChecklist, index: number, start: number) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(60, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(60, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(60, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Hand over to:');
        jspdf.text(60, start + 50, this.userName(report.handOverTo));

        const array = report.dailyCheckList.data;
        let pullBack = 0, head = 60, skipAhead = 0;
        if (array.length) {
            jspdf.text(20, start + head, 'Details:');
            head += 10;

            array.forEach((a, i) => {
                const remark = a.remarks;
                const remarkLines = jspdf.splitTextToSize(`Remark: ${remark}`, jspdf.internal.pageSize.width - 61);

                if (start + head + 10 + (i - pullBack) * 10 + (skipAhead + remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    start = 0;
                    pullBack = i;
                    head = 20;
                    skipAhead = 0;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.question);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(String(a.quantity)) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, String(a.quantity));

                if (remark) {
                    head += 10;
                    jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, remarkLines);
                    skipAhead += remarkLines.length - 1;
                }
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'daily-checklist';
    }
}
