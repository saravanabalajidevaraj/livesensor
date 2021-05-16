import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { JobAppraisal } from '../../../_models';

@Component({
    selector: 'app-ja-search',
    templateUrl: './search.component.html'
})
export class JASearchComponent extends SearchComponent<JobAppraisal> {
    public userError: string = '';

    validate(from: Date, to: Date, payload: any) {
        this.userError = '';
        this.timeError = '';

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        if (!this.users.has(payload.employeeId)) {
            this.userError = 'Select a valid user';
            return false;
        }

        return true;
    }

    protected excelFormatter(worksheet: WorkSheet, report: JobAppraisal, index: number) {
        const values = [
            ['S/No', index + 1],
            ['User', this.userName(report.userId)],
            ['Employee', this.userName(report.employeeId)],
            ['Period', report.appraisalPeriod],
            ['Date', this.pipe.transform(report.appraisalDate, 'dd/MM/yyyy')],

            ...report.performanceReview.data.map(a => [a.item, a.selection]),

            ['Rating', report.overallRating],
            ['Strengths', report.empStrengths],
            ['Improvement Areas', report.empPerformanceAreas],
            ['Plan of Action', report.planOfAction]
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

    protected pdfFormatter(jspdf: jsPDF, report: JobAppraisal, index: number, start: number) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(70, start + 20, this.pipe.transform(report.appraisalDate, 'dd/MM/yyyy'));

        jspdf.text(20, start + 30, 'User:');
        jspdf.text(70, start + 30, this.userName(report.userId));

        jspdf.text(20, start + 40, 'Employee:');
        jspdf.text(70, start + 40, this.userName(report.employeeId));

        jspdf.text(20, start + 50, 'Period:');
        jspdf.text(70, start + 50, report.appraisalPeriod);

        jspdf.text(20, start + 60, 'Rating:');
        jspdf.text(70, start + 60, report.overallRating);

        let head = 70;
        const strengthLines = jspdf.splitTextToSize(report.empStrengths, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (strengthLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Strengths:');
        jspdf.text(40, start + head + 10, strengthLines);
        let skipAhead = strengthLines.length - 1;
        head += 20;

        const perfLines = jspdf.splitTextToSize(report.empPerformanceAreas, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + perfLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Improvement Areas:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, perfLines);
        skipAhead += perfLines.length - 1;
        head += 20;

        const planLines = jspdf.splitTextToSize(report.planOfAction, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + planLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Plan of Action:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, planLines);
        skipAhead += planLines.length - 1;
        head += 20;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }

        const array = report.performanceReview.data;
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                if (start + head + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.item);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.selection);
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'job-appraisal';
    }
}
