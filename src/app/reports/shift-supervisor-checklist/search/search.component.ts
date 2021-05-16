import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { ShiftSupervisorChecklist } from '../../../_models';

@Component({
    selector: 'app-ssc-search',
    templateUrl: './search.component.html'
})
export class SSCSearchComponent extends SearchComponent<ShiftSupervisorChecklist> {

    protected excelFormatter(worksheet: WorkSheet, report: ShiftSupervisorChecklist, index: number) {
        const items = this.items(report);

        const values = [
            ['S/No', index + 1],
            ['Date', this.pipe.transform(report.dateTime, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateTime, 'dd/MM/yyyy')],
            ['Address', report.address],
            ['Security Supervisor', this.userName(report.securitySupervisorId)],

            ...items.map(a => [a.question, a.isSelected ? 'Yes' : 'No', a.remarks ? `Remarks: ${a.remarks}` : '']),

            ['Other Remarks', report.otherRemarks]
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

    protected pdfFormatter(jspdf: jsPDF, report: ShiftSupervisorChecklist, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Supervisor:');
        jspdf.text(70, start + 30, this.userName(report.securitySupervisorId));

        let head = 40;
        const addLines = jspdf.splitTextToSize(report.address, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (addLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Address:');
        jspdf.text(40, start + head + 10, addLines);
        let skipAhead = addLines.length - 1;
        head += 20

        const remarkLines = jspdf.splitTextToSize(report.otherRemarks, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Other Remarks:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, remarkLines);
        skipAhead += remarkLines.length - 1;
        head += 20

        const array = this.items(report);
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const quesLines = jspdf.splitTextToSize(a.question, jspdf.internal.pageSize.width - 76);
                const remarkLines = jspdf.splitTextToSize(`Remarks: ${a.remarks || ''}`, jspdf.internal.pageSize.width - 61);
                if (start + head + 20 + (i - pullBack) * 10 + (skipAhead + quesLines.length + remarkLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }

                const response = a.isSelected ? 'Yes' : 'No';
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, quesLines);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(response) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, response);
                skipAhead += quesLines.length - 1;

                if (a.remarks) {
                    head += 10
                    jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, remarkLines);
                    skipAhead += remarkLines.length - 1;
                }
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    private items(report: ShiftSupervisorChecklist) {
        return [
            ...report.turnoutBearings.data,
            ...report.occurrenceBook.data,
            ...report.equipment.data,
            ...report.documents.data
        ];
    }

    protected fileName() {
        return 'shift-supervisor-checklist';
    }
}
