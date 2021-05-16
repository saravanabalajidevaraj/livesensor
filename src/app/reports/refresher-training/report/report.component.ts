import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { RefresherTraining } from '../../../_models';

@Component({
    selector: 'app-rt-report',
    templateUrl: './report.component.html'
})
export class RTReportComponent extends ReportComponent<RefresherTraining> {
    public durations: Array<string> = [
        '1 Month', '1.5 Months', '2 Months', '2.5 Months', '3 Months', '3.5 Months',
        '4 Months', '4.5 Months', '5 Months', '5.5 Months', '6 Months'
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

    protected pdfFormatter(jspdf: jsPDF, report: RefresherTraining, start: number, images: Array<string>) {
        let head = 20;
        if (start + head + 10 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }

        jspdf.text(20, start + head, 'Date:');
        jspdf.text(70, start + head, this.pipe.transform(report.trainingDate, 'dd/MM/yyyy'));
        head += 10;

        if (start + head + 10 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Conducted By:');
        jspdf.text(70, start + head, this.userName(report.conductedBy));
        head += 10;

        if (start + head + 10 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Topic:');
        jspdf.text(70, start + head, report.trainingTopic);
        head += 10;

        if (start + head + 10 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Duration:');
        jspdf.text(70, start + head, report.trainingDuration);
        head += 10;

        if (start + head + 20 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            head = 20;
            start = 0;
        }
        jspdf.text(20, start + head, 'Security Officers:');
        head += 10;

        let pullback = 0;
        report.attendees.forEach((a, i) => {
            if (start + head + 10 + (i - pullback) * 10 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
                start = 0;
            }
            jspdf.text(40, start + head + (i - pullback) * 10, this.userName(a));
        });
        head += (report.attendees.length - pullback) * 10;

        if (images.length) {
            let width = 0;
            const imageHeight = 90, imageWidth = 60, padding = 20;

            if (start + head + imageHeight > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
                start = 0;
            }
            jspdf.text(20, start + head, 'Images:');
            head += 10;

            images.forEach((a, i) => {
                if (padding * 2 + width + imageWidth > jspdf.internal.pageSize.width) {
                    width = 0;
                    head += imageHeight + padding;
                }

                if (start + head + imageHeight > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    head = 20;
                    start = 0;
                }
                jspdf.addImage(a, 'JPEG', padding + width, start + head, imageWidth, imageHeight);
                width += imageWidth + padding / 2;
            });
            head += imageHeight + 10;
        }
        jspdf.line(10, start + head, jspdf.internal.pageSize.width - 10, start + head);
        head += 20;

        if (start + head + 90 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head, 'Client\'s Acknowledgment');
        head += 10;

        jspdf.text(20, start + head, 'Name:');
        head += 10;

        jspdf.text(20, start + head, 'Designation:');
        head += 10;

        jspdf.text(20, start + head, 'Date:');
        head += 20;

        jspdf.text(20, start + head, 'Live Sensor Management Acknowledgement');
        head += 10;

        jspdf.text(20, start + head, 'Name:');
        head += 10;

        jspdf.text(20, start + head, 'Designation:');
        head += 10;

        jspdf.text(20, start + head, 'Date:');
    }

    protected fileName() {
        return 'refresher-training';
    }

    updateDate(value: string) {
        this.report.trainingDate = this.considerTimezone(`${value}T${this.clientTime(this.report.trainingDate)}:00.000Z`);
    }

    updateDuration(value: string) {
        this.report.trainingDuration = value;
    }

    submit() {
        const {
            _id, siteId, conductedBy, trainingTopic, trainingDate, trainingDuration, attendees
        } = this.report;

        this.updateReport({
            _id, siteId, conductedBy, trainingTopic, trainingDate, trainingDuration, attendees
        });
    }
}
