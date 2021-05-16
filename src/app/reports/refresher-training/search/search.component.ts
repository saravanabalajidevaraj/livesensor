import { Component } from '@angular/core';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { RefresherTraining } from '../../../_models';

@Component({
    selector: 'app-rt-search',
    templateUrl: './search.component.html'
})
export class RTSearchComponent extends SearchComponent<RefresherTraining> {
    public userError: string = '';

    validate(from: Date, to: Date, payload: any) {
        this.userError = '';

        if (!super.validate(from, to, payload)) return false;

        if (!this.users.has(payload.conductedBy)) {
            this.userError = 'Select a valid user';
            return false;
        }

        return true;
    }

    protected excelFormatter(worksheet: WorkSheet, report: RefresherTraining, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Conducted By', this.userName(report.conductedBy)],
            ['Topic', report.trainingTopic],
            ['Date', this.pipe.transform(report.trainingDate, 'dd/MM/yyyy')],
            ['Duration', report.trainingDuration],

            ...report.attendees.map((a, i) => [i ? undefined : 'Security Officers', this.userName(a)])
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

        start += 5;

        if (report.attendees.length) {
            worksheet['!merges'].push({ s: { r: start, c: 0 }, e: { r: start + report.attendees.length - 1, c: 0 } });
        }
    }

    exportAsPdf() {
        this.downloadService.exportAsPdf(this.fileName(), jspdf => {
            let head = 10;
            const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
            jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, head, imageWidth, imageHeight);
            head += imageHeight + 10;

            const heading = this.reportName();
            jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, head, heading);
            head += 20;

            this.reports.forEach(report => {
                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }

                jspdf.text(20, head, 'Date:');
                jspdf.text(70, head, this.pipe.transform(report.trainingDate, 'dd/MM/yyyy'));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Conducted By:');
                jspdf.text(70, head, this.userName(report.conductedBy));
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Topic:');
                jspdf.text(70, head, report.trainingTopic);
                head += 10;

                if (head + 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Duration:');
                jspdf.text(70, head, report.trainingDuration);
                head += 10;

                if (head + 20 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                }
                jspdf.text(20, head, 'Security Officers:');
                head += 10;

                let pullback = 0;
                report.attendees.forEach((a, i) => {
                    if (head + 10 + (i - pullback) * 10 > jspdf.internal.pageSize.height) {
                        jspdf.addPage();
                        head = 20;
                    }
                    jspdf.text(40, head + (i - pullback) * 10, this.userName(a));
                });
                head += (report.attendees.length - pullback) * 10;

                jspdf.line(20, head, jspdf.internal.pageSize.width - 20, head);
                head += 10;
            });
        });
    }

    protected fileName() {
        return 'refresher-training';
    }
}
