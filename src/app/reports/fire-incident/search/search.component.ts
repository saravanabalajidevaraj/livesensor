import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { FireIncident } from '../../../_models';

@Component({
    selector: 'app-fi-search',
    templateUrl: './search.component.html'
})
export class FISearchComponent extends SearchComponent<FireIncident> {

    protected excelFormatter(worksheet: WorkSheet, report: FireIncident, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['User', this.userName(report.userId)],
            ['Incident Type', report.incidentType],
            ['Date', this.pipe.transform(report.incidentDateTime, 'dd/MM/yyyy')],
            ['Start Time', this.pipe.transform(report.incidentDateTime, 'HH:mm')],
            ['End Time', this.pipe.transform(report.drillEndTime, 'HH:mm')],
            ['Block / Floor / Zone', report.blockFloorZone],
            ['Location', report.location],
            ['Cause', report.cause],
            ['Officers Count', report.involvedSOCount],
            ['Remarks', report.remarks],
            ['Description', report.fullDescription],

            ...report.response.data.map(a => [a.question, a.response ? 'Yes' : 'No']),

            ['Security Manager', this.userName(report.securityStaff)],
            ['Estates / Manager', this.userName(report.managementStaff)]
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

    protected pdfFormatter(jspdf: jsPDF, report: FireIncident, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.incidentDateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.incidentDateTime, 'HH:mm') + ' - ' +
            this.pipe.transform(report.drillEndTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Incident Type:');
        jspdf.text(70, start + 50, report.incidentType);

        jspdf.text(20, start + 60, 'Block/Floor/Zone:');
        jspdf.text(70, start + 60, report.blockFloorZone);

        jspdf.text(20, start + 70, 'Location:');
        jspdf.text(70, start + 70, report.location);

        jspdf.text(20, start + 80, 'Cause:');
        jspdf.text(70, start + 80, report.cause);

        jspdf.text(20, start + 90, 'Officers Count:');
        jspdf.text(70, start + 90, String(report.involvedSOCount));
        let head = 100;

        const remarkLines = jspdf.splitTextToSize(report.remarks, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Remarks:');
        jspdf.text(40, start + head + 10, remarkLines);
        let skipAhead = remarkLines.length - 1;
        head += 20;

        const descLines = jspdf.splitTextToSize(report.fullDescription, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (skipAhead + descLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Description:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, descLines);
        skipAhead += descLines.length - 1;
        head += 20;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Security Manager:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.securityStaff));
        head += 10;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Estates/Manager:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.managementStaff));
        head += 10;

        const array = report.response.data;
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');

            let pullBack = 0;
            head += 10;
            array.forEach((a, i) => {
                if (start + head + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }
                const response = a.response ? 'Yes' : 'No';

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.question);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(response) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, response);
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'fire-incident';
    }
}
