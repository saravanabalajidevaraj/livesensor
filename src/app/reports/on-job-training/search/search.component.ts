import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { OnJobTraining } from '../../../_models';

@Component({
    selector: 'app-ojt-search',
    templateUrl: './search.component.html'
})
export class OJTSearchComponent extends SearchComponent<OnJobTraining> {
    public userError: string = '';

    validate(from: Date, to: Date, payload: any) {
        this.userError = '';

        if (!super.validate(from, to, payload)) return;

        if (!payload.mentorId) {
            this.userError = 'Select a valid user';
            return false;
        }

        return true;
    }

    protected excelFormatter(worksheet: WorkSheet, report: OnJobTraining, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['Date', this.pipe.transform(report.trainingDate, 'dd/MM/yyyy')],
            ['Mentor', this.userName(report.mentorId)],
            ['Trainee', this.userName(report.traineeId)],
            ['Period', report.trainingPeriod],

            ...report.trainingProgress.data.map(a => [a.competency, a.progress]),

            ['Score', report.overallRating],
            ['Location', report.location],

            ...report.areasOfConcern.data.map((a, i) => [i ? undefined : 'Concerns', a])
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

        start += 8 + report.trainingProgress.data.length;

        if (report.areasOfConcern.data.length) {
            worksheet['!merges'].push({ s: { r: start, c: 0 }, e: { r: start + report.areasOfConcern.data.length - 1, c: 0 } });
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: OnJobTraining, index: number, start: number) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(70, start + 20, this.pipe.transform(report.trainingDate, 'dd/MM/yyyy'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Mentor:');
        jspdf.text(70, start + 40, this.userName(report.mentorId));

        jspdf.text(20, start + 50, 'Trainee:');
        jspdf.text(70, start + 50, this.userName(report.traineeId));

        jspdf.text(20, start + 60, 'Period:');
        jspdf.text(70, start + 60, report.trainingPeriod);

        jspdf.text(20, start + 70, 'Score:');
        jspdf.text(70, start + 70, report.overallRating);

        jspdf.text(20, start + 80, 'Location:');
        jspdf.text(70, start + 80, report.location);

        const concerns = report.areasOfConcern.data;
        let head = 90, skipAhead = 0;
        if (concerns.length) {
            jspdf.text(20, start + head, 'Concerns:');
            head += 10

            concerns.forEach((a, i) => {
                const concernLines = jspdf.splitTextToSize(a, jspdf.internal.pageSize.width - 61);
                if (start + head + (skipAhead + concernLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    start = 0;
                    head = 20;
                    skipAhead = 0;
                }
                jspdf.text(40, start + head + skipAhead * 6.5, concernLines);
                skipAhead += concernLines.length - 1;
                head += 10;
            });
        }

        const array = report.trainingProgress.data;
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const width = jspdf.getStringUnitWidth(a.progress) * 5;
                const competency = jspdf.splitTextToSize(a.competency, jspdf.internal.pageSize.width - width - 81);
                if (start + head + 10 + (i - pullBack) * 10 + (skipAhead + competency.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, competency);
                jspdf.text(jspdf.internal.pageSize.width - width - 20, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.progress);
                skipAhead += competency.length;
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'on-job-training';
    }
}
