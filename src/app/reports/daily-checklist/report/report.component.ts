import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import { DailyChecklist, User } from '../../../_models';

@Component({
    selector: 'app-dc-report',
    templateUrl: './report.component.html'
})
export class DCReportComponent extends ReportComponent<DailyChecklist> {

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

    protected pdfFormatter(jspdf: jsPDF, report: DailyChecklist, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'Date:');
        jspdf.text(60, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(60, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(60, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Hand over to:');
        jspdf.text(60, start + 50, this.userName(report.handOverTo));

        const array = report.dailyCheckList.data;
        let head = 60, skipAhead = 0;
        if (array.length) {
            jspdf.text(20, start + head, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const remark = a.remarks;
                const remarkLines = jspdf.splitTextToSize(`Remark: ${remark}`, jspdf.internal.pageSize.width - 61);

                if (start + head + 10 + (i - pullBack) * 10 + (skipAhead + remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    start = 0;
                    pullBack = i;
                    head = 20;
                    skipAhead = 0;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.question);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(String(a.quantity)) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, String(a.quantity));

                if (remark) {
                    head += 10;
                    jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, remarkLines);
                    skipAhead += remarkLines.length - 1;
                }
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

        if (start + head + 30 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'Name:');
        jspdf.text(60, start + head + skipAhead * 6.5, this.userName(report.handOverTo));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Date:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Time:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.pipe.transform(report.dateCreated, 'HH:mm'));
    }

    protected fileName() {
        return 'daily-checklist';
    }

    submit() {
        const {
            _id, siteId, handOverTo, images, dailyCheckList
        } = this.report;

        this.updateReport({_id, siteId, handOverTo, dailyCheckList});
    }
}
