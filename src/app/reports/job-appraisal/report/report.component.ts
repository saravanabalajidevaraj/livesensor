import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import { JobAppraisal } from '../../../_models';

@Component({
    selector: 'app-ja-report',
    templateUrl: './report.component.html'
})
export class JAReportComponent extends ReportComponent<JobAppraisal> {
    public periods: Array<string> = [
        '6 Months', '7 Months', '8 Months', '9 Months', '10 Months', '11 Months', '12 Months'
    ];

    public perf_options: Array<string> = [
        'Strongly agree', 'Occasionally agree', 'Somewhat agree', 'Disagree', 'Strongly disagree'
    ];

    protected pdfFormatter(jspdf: jsPDF, report: JobAppraisal, start: number, images: Array<string>) {
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
            head += (array.length - pullBack) * 10;
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        if (start + head + 90 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
            skipAhead = 0;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'SIGNATURES');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Employee:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.employeeId));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.appraisalDate, 'dd/MM/yyyy'));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(70, start + head + skipAhead * 6.5, '');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Evaluated By:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.userId));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.appraisalDate, 'dd/MM/yyyy'));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Reviewed By:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + skipAhead * 6.5, 'Date:');
    }

    protected fileName() {
        return 'job-appraisal';
    }

    updatePeriod(value: string) {
        this.report.appraisalPeriod = value;
    }

    updatePerformance(index: number, value: string) {
        this.report.performanceReview.data[index].selection = value;
    }

    updateDate(value: string) {
        this.report.appraisalDate = this.considerTimezone(`${value}T${this.clientTime(this.report.appraisalDate)}:00.000Z`);
    }

    submit() {
        const {
            _id, employeeId, appraisalPeriod, appraisalDate, overallRating,
            empStrengths, empPerformanceAreas, planOfAction, performanceReview
        } = this.report;

        this.updateReport({
            _id, employeeId, appraisalPeriod, appraisalDate, overallRating,
            empStrengths, empPerformanceAreas, planOfAction, performanceReview
        });
    }
}
