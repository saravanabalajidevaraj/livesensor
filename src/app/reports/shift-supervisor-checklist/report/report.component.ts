import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { ShiftSupervisorChecklist } from '../../../_models';

@Component({
    selector: 'app-ssc-report',
    templateUrl: './report.component.html'
})
export class SSCReportComponent extends ReportComponent<ShiftSupervisorChecklist> {

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

    protected pdfFormatter(jspdf: jsPDF, report: ShiftSupervisorChecklist, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Supervisor:');
        jspdf.text(70, start + 30, this.userName(report.securitySupervisorId));

        let head = 40;
        const addLines = jspdf.splitTextToSize(report.address, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (addLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Address:');
        jspdf.text(40, start + head + 10, addLines);
        let skipAhead = addLines.length - 1;
        head += 20

        const remarkLines = jspdf.splitTextToSize(report.otherRemarks, jspdf.internal.pageSize.width - 61);
        if (start + head + 20 + (skipAhead + remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Other Remarks:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, remarkLines);
        skipAhead += remarkLines.length - 1;
        head += 20

        const array = this.items(report);
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const quesLines = jspdf.splitTextToSize(a.question, jspdf.internal.pageSize.width - 76);
                const remarkLines = jspdf.splitTextToSize(`Remarks: ${a.remarks || ''}`, jspdf.internal.pageSize.width - 61);
                if (start + head + 20 + (i - pullBack) * 10 + (skipAhead + quesLines.length + remarkLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    skipAhead = 0;
                    head = 20;
                }

                const response = a.isSelected ? 'Yes' : 'No';
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, quesLines);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(response) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, response);
                skipAhead += quesLines.length - 1;

                if (a.remarks) {
                    head += 10
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

        if (start + head + 110 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            skipAhead = 0;
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head + skipAhead * 6.5, 'SO Signatures:');
        head += 10;

        new Array(5).fill(0).forEach((a, i) => {
            jspdf.text(20, start + head + i * 10 + skipAhead * 6.5, (i + 1) + '. SO:');
            jspdf.text(jspdf.internal.pageSize.width / 1.75, start + head + i * 10 + skipAhead * 6.5, 'Date:');
        });
        head += 60;

        jspdf.text(20, start + head + skipAhead * 6.5, 'SUPR Name:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'OE / OM:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Signature:');
    }

    private items(report: ShiftSupervisorChecklist) {
        return [
            ...report.turnoutBearings.data,
            ...report.occurrenceBook.data,
            ...report.equipment.data,
            ...report.documents.data
        ];
    }

    protected fileName() {
        return 'shift-supervisor-checklist';
    }

    updateDate(value: string) {
        this.report.dateTime = this.considerTimezone(`${value}T${this.clientTime(this.report.dateTime)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.dateTime = this.considerTimezone(`${this.clientDate(this.report.dateTime)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, dateTime, address, securitySupervisorId, otherRemarks,
            turnoutBearings, occurrenceBook, equipment, documents
        } = this.report;

        this.updateReport({
            _id, siteId, dateTime, address, securitySupervisorId, otherRemarks,
            turnoutBearings, occurrenceBook, equipment, documents
        });
    }
}
