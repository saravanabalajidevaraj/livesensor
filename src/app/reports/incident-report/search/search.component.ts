import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { IncidentReport } from '../../../_models';

@Component({
    selector: 'app-ir-search',
    templateUrl: './search.component.html'
})
export class IRSearchComponent extends SearchComponent<IncidentReport> {

    protected excelFormatter(worksheet: WorkSheet, report: IncidentReport, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Report No', report.reportNo],
            ['Site', this.siteName(report.siteId)],
            ['User', this.userName(report.userId)],
            ['Location', report.location],
            ['Date', this.pipe.transform(report.incidentDate, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.incidentDate, 'HH:mm')],
            ['Subject', report.subject],
            ['Description', report.incidentDescription],
            ['Follow up actions', report.followUpActionTaken],
            ['Victim Name', report.victimParticulars.name],
            ['Victim Sex', report.victimParticulars.sex],
            ['Victim No', report.victimParticulars.victimNo],
            ['Victim Address', report.victimParticulars.address]
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

    protected pdfFormatter(jspdf: jsPDF, report: IncidentReport, index: number, start: number) {
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

        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'incident-report';
    }
}
