import { Component } from '@angular/core';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { PerformanceEvaluation } from '../../../_models';

@Component({
    selector: 'app-pe-report',
    templateUrl: './report.component.html'
})
export class PEReportComponent extends ReportComponent<PerformanceEvaluation> {
    public perfItems: Array<string> = [
        'Far Exceeds', 'Exceeds', 'Fully Meets', 'Marginally Meets', 'Do Not Meet'
    ];

    public periods: Array<string> = [
        '1 Month', '2 Months', '3 Months', '6 Months', '1 Year'
    ];

    private ratingDefinitions: Array<Array<string>> = [
        ['Far Exceeds (FE)', 'Performance is exceptional and consistently far exceeds expectations.'],
        ['Exceeds (E)', 'Performance consistently exceeds normal expectations and job requirements.'],
        ['Fully Meets (FM)', 'Performance consistently meets expectations and job requirements.'],
        ['Marginally Meets (MM)', 'Performance consistently marginally meets below the acceptable expectations. Requires constant supervision.'],
        ['Do Not Meet (DNM)', 'Performance fails to meet minimum acceptable standards.']
    ];

    protected pdfFormatter(jspdf: jsPDF, report: PerformanceEvaluation, start: number, images: Array<string>) {
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
            head += (array.length - pullBack) * 10;
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        const process = 'If there are disagreements with the assigned rating, the employee can appeal to the management committee within 7 days.';
        const processLines = jspdf.splitTextToSize(process, jspdf.internal.pageSize.width - 21);

        if (start + head + 220 + (skipAhead + processLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'Employee Signature:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Appeal Process:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, processLines);
        skipAhead += processLines.length - 1;
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Director Supervisor:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Next Level Supervisor:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'FOR OFFICE ONLY');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Recommended Increment:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Manager:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Reviewed By:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
        head += 20;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Approved By:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
    }

    protected fileName() {
        return 'performance-evaluation';
    }

    updatePeriod(value: string) {
        this.report.reviewPeriod = value;
    }

    updateCriteria(index: number, value: string) {
        this.report.performanceCriteria.data[index].selection = value;
    }

    submit() {
        const {
            _id, employeeId, evaluatorId, reviewPeriod, objectives,
            accomplishments, performanceSummary, developmentPlan, nextYearTarget,
            overallPerformance, performanceCriteria
        } = this.report;

        this.updateReport({
            _id, employeeId, evaluatorId, reviewPeriod, objectives,
            accomplishments, performanceSummary, developmentPlan, nextYearTarget,
            overallPerformance, performanceCriteria
        });
    }
}
