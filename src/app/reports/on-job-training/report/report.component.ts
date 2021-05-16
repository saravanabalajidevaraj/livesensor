import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { OnJobTraining } from '../../../_models';

@Component({
    selector: 'app-ojt-report',
    templateUrl: './report.component.html'
})
export class OJTReportComponent extends ReportComponent<OnJobTraining> {
    public periods: Array<string> = [
        '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours', '3.5 hours', '4 hours', '4.5 hours',
        '5 hours', '5.5 hours', '6 hours', '6.5 hours', '7 hours', '7.5 hours', '8 hours'
    ];
    public progressOptions: Array<string> = [
        'Well Understood', 'Average Understanding', 'Did Not Understand'
    ];

    exportAsPdf() {
        const images = this.report.images
        if (images.length) {
            this.showProgress();
            Observable.forkJoin([
                ...images.map(a => this.imageService.imageString(a.id))
            ]).subscribe(data => {
                this.hideProgress();
                this.exportPdf(data);
            }, data => {
                this.hideProgress();
                this.failure(data);
            });
        } else {
            this.exportPdf([]);
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: OnJobTraining, start: number, images: Array<string>) {
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

            let pullBack = 0;
            concerns.forEach((a, i) => {
                const concernLines = jspdf.splitTextToSize(a, jspdf.internal.pageSize.width - 61);
                if (start + head + (i - pullBack) * 10 + (skipAhead + concernLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    start = 0;
                    head = 20;
                    skipAhead = 0;
                    pullBack = i;
                }
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, concernLines);
                skipAhead += concernLines.length - 1;
            });
            head += (concerns.length - pullBack) * 10;
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
                skipAhead += competency.length - 1;
            });
            head += (array.length - pullBack) * 10;
        }

        if (images.length) {
            let width = 0;
            const imageHeight = 90, imageWidth = 60, padding = 20;

            if (start + head + 10 + skipAhead * 6.5 + imageHeight > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
                start = 0;
                skipAhead = 0;
            }
            jspdf.text(20, start + head + skipAhead * 6.5, 'Images:');
            head += 10;

            images.forEach((a, i) => {
                if (padding * 2 + width + imageWidth > jspdf.internal.pageSize.width) {
                    width = 0;
                    head += imageHeight + padding;
                }

                if (start + head + skipAhead * 6.5 + imageHeight > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                    start = 0;
                    skipAhead = 0;
                }
                jspdf.addImage(a, 'JPEG', padding + width, start + head + skipAhead * 6.5, imageWidth, imageHeight);
                width += imageWidth + padding / 2;
            });
            head += imageHeight + 10;
        }
        jspdf.line(10, start + head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, start + head + skipAhead * 6.5);
        head += 20;

        if (start + head + 20 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'Manager:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Trainee:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.traineeId));
    }

    protected fileName() {
        return 'on-job-training';
    }

    updatePeriod(value: string) {
        this.report.trainingPeriod = value;
    }

    updateProgress(index: number, value: string) {
        this.report.trainingProgress.data[index].progress = value;
    }

    updateDate(value: string) {
        this.report.trainingDate = this.considerTimezone(`${value}T${this.clientTime(this.report.trainingDate)}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, mentorId, traineeId, trainingPeriod, overallRating,
            location, trainingDate, trainingProgress, areasOfConcern
        } = this.report;

        areasOfConcern.data = areasOfConcern.data.map(a => a.trim()).filter(a => a);

        this.updateReport({
            _id, siteId, mentorId, traineeId, trainingPeriod, overallRating,
            location, trainingDate, trainingProgress, areasOfConcern
        });
    }
}
