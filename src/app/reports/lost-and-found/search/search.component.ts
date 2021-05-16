import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { LostAndFound } from '../../../_models';

@Component({
    selector: 'app-laf-search',
    templateUrl: './search.component.html'
})
export class LAFSearchComponent extends SearchComponent<LostAndFound> {

    protected excelFormatter(worksheet: WorkSheet, report: LostAndFound, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['User', this.userName(report.userId)],
            ['Date', this.pipe.transform(report.dateTime, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateTime, 'HH:mm')],
            ['Location', report.location],
            ['Informant', report.informant],
            ['Contact No', report.contactNo],

            ...report.items.data.map(a => [a.name, a.count])
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

    protected pdfFormatter(jspdf: jsPDF, report: LostAndFound, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Informant:');
        jspdf.text(70, start + 50, report.informant);

        jspdf.text(20, start + 60, 'Location:');
        jspdf.text(70, start + 60, report.location);

        jspdf.text(20, start + 70, 'Contact No:');
        jspdf.text(70, start + 70, report.contactNo);

        const array = report.items.data;
        if (array.length) {
            jspdf.text(20, start + 80, 'Details:');

            let pullBack = 0, head = 90;
            array.forEach((a, i) => {
                if (start + head + (i - pullBack) * 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10, a.name);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(String(a.count)) * 5 - 20,
                    start + head + (i - pullBack) * 10, String(a.count));
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'lost-and-found';
    }
}
