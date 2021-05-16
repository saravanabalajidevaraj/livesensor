import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { SiteVisit } from '../../../_models';

@Component({
    selector: 'app-sv-report',
    templateUrl: './report.component.html'
})
export class SVReportComponent extends ReportComponent<SiteVisit> {

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

    protected pdfFormatter(jspdf: jsPDF, report: SiteVisit, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.timeIn, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.timeIn, 'HH:mm') +
            ' - ' + this.pipe.transform(report.timeOut, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'Conducted By:');
        jspdf.text(70, start + 40, this.userName(report.visitedUserId));

        let head = 50;
        if (images.length) {
            let width = 0;
            const imageHeight = 90, imageWidth = 60, padding = 20;

            if (start + head + 10 + imageHeight > jspdf.internal.pageSize.height) {
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
        }
    }

    protected fileName() {
        return 'site-visit';
    }

    updateDate(value: string) {
        this.report.timeIn = this.considerTimezone(`${value}T${this.clientTime(this.report.timeIn)}:00.000Z`);
        this.report.timeOut = this.considerTimezone(`${value}T${this.clientTime(this.report.timeOut)}:00.000Z`);
    }

    updateTimeIn(value: string) {
        this.report.timeIn = this.considerTimezone(`${this.clientDate(this.report.timeIn)}T${value}:00.000Z`);
    }

    updateTimeOut(value: string) {
        this.report.timeOut = this.considerTimezone(`${this.clientDate(this.report.timeOut)}T${value}:00.000Z`);
    }

    submit() {
        const {_id, siteId, visitedUserId, timeIn, timeOut} = this.report;

        this.updateReport({_id, siteId, visitedUserId, timeIn, timeOut});
    }
}
