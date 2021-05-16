import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { PerformanceEvaluation } from '../../../_models';

@Component({
    selector: 'app-pe-search',
    templateUrl: './search.component.html'
})
export class PESearchComponent extends SearchComponent<PerformanceEvaluation> {
    public userError: string = '';

    private ratingDefinitions: Array<Array<string>> = [
        ['Far Exceeds (FE)', 'Performance is exceptional and consistently far exceeds expectations.'],
        ['Exceeds (E)', 'Performance consistently exceeds normal expectations and job requirements.'],
        ['Fully Meets (FM)', 'Performance consistently meets expectations and job requirements.'],
        ['Marginally Meets (MM)', 'Performance consistently marginally meets below the acceptable expectations. Requires constant supervision.'],
        ['Do Not Meet (DNM)', 'Performance fails to meet minimum acceptable standards.']
    ];

    validate(from: Date, to: Date, payload: any) {
        this.userError = '';
        this.timeError = '';

        if (!this.users.has(payload.employeeId)) {
            this.userError = 'Select a valid user';
            return false;
        }

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        return true;
    }

    protected excelFormatter(worksheet: WorkSheet, report: PerformanceEvaluation, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Date', this.pipe.transform(report.dateCreated, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateCreated, 'HH:mm')],
            ['Employee', this.userName(report.employeeId)],
            ['Evaluator', this.userName(report.evaluatorId)],
            ['Review Period', report.reviewPeriod],
            ['Objectives', report.objectives],
            ['Accomplishments', report.accomplishments],

            ['Rating Definitions', ''],
            ...this.ratingDefinitions,

            ...report.performanceCriteria.data.map(a => [a.criteria, a.selection]),

            ['Performance Summary', report.performanceSummary],
            ['Development Plan', report.developmentPlan],
            ['Next Year Targets', report.nextYearTarget],
            ['Overall Performance', report.overallPerformance]
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

    protected pdfFormatter(jspdf: jsPDF, report: PerformanceEvaluation, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateCreated, 'HH:mm'));

        jspdf.text(20, start + 30, 'Employee:');
        jspdf.text(70, start + 30, this.userName(report.employeeId));

        jspdf.text(20, start + 40, 'Evaluator:');
        jspdf.text(70, start + 40, this.userName(report.evaluatorId));

        jspdf.text(20, start + 50, 'Review Period:');
        jspdf.text(70, start + 50, report.reviewPeriod);

        let head = 60;
        const objLines = jspdf.splitTextToSize(report.objectives, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (objLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Objectives:');
        jspdf.text(40, start + head + 10, objLines);
        let skipAhead = objLines.length - 1;
        head += 20;

        const accLines = jspdf.splitTextToSize(report.accomplishments, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + accLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Accomplishments:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, accLines);
        skipAhead += accLines.length - 1;
        head += 20;

        const summLines = jspdf.splitTextToSize(report.performanceSummary, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + summLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Performance Summary:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, summLines);
        skipAhead += summLines.length - 1;
        head += 20;

        const devLines = jspdf.splitTextToSize(report.developmentPlan, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + devLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Development Plan:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, devLines);
        skipAhead += devLines.length - 1;
        head += 20;

        const tarLines = jspdf.splitTextToSize(report.nextYearTarget, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + tarLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Next Year Targets:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, tarLines);
        skipAhead += tarLines.length - 1;
        head += 20;

        const perfLines = jspdf.splitTextToSize(report.overallPerformance, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + perfLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Overall Performance:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, perfLines);
        skipAhead += perfLines.length - 1;
        head += 20;

        if (start + head + 20 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
            skipAhead = 0;
        }

        const array = report.performanceCriteria.data;
        if (array.length) {
            jspdf.text(20, start + head + 10 + skipAhead * 6.5, 'Rating Definitions:');
            head += 20;

            let pullBack = 0;
            this.ratingDefinitions.forEach((a, i) => {
                const defLines = jspdf.splitTextToSize(a[1], jspdf.internal.pageSize.width - 101);
                if (start + head + (i - pullBack) * 10 + (skipAhead + defLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                    start = 0;
                    pullBack = i;
                    skipAhead = 0;
                }

                jspdf.text(20, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a[0]);
                jspdf.text(80, start + head + (i - pullBack) * 10 + skipAhead * 6.5, defLines);
                skipAhead += defLines.length - 1;
            });
            head += (this.ratingDefinitions.length - pullBack) * 10;

            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10, pullBack = 0;
            array.forEach((a, i) => {
                if (start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.criteria);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.selection);
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'performance-evaluation';
    }
}
