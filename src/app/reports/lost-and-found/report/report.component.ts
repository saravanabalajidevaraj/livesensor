import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import { LostAndFound } from '../../../_models';

@Component({
    selector: 'app-laf-report',
    templateUrl: './report.component.html'
})
export class LAFReportComponent extends ReportComponent<LostAndFound> {

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

    protected pdfFormatter(jspdf: jsPDF, report: LostAndFound, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Informant:');
        jspdf.text(70, start + 50, report.informant);

        jspdf.text(20, start + 60, 'Location:');
        jspdf.text(70, start + 60, report.location);

        jspdf.text(20, start + 70, 'Contact No:');
        jspdf.text(70, start + 70, report.contactNo);

        const array = report.items.data;
        let head = 80;
        if (array.length) {
            jspdf.text(20, start + head, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                if (start + head + 10 + (i - pullBack) * 10 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    pullBack = i;
                    start = 0;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10, a.name);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(String(a.count)) * 5 - 20,
                    start + head + (i - pullBack) * 10, String(a.count));
            });
            head += (array.length - pullBack) * 10;
        }

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
            head += imageHeight + 10;
        }
        jspdf.line(10, start + head, jspdf.internal.pageSize.width - 10, start + head);
        head += 20;

        if (start + head + 140 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }

        jspdf.text(20, start + head, 'FOR OFFICIAL USE ONLY');
        head += 10;

        jspdf.text(20, start + head, 'Taken Over By');
        head += 10;

        jspdf.text(20, start + head, 'Name:');
        jspdf.text(70, start + head, this.userName(report.userId));
        head += 10;

        const user = this.users.get(report.userId);
        jspdf.text(20, start + head, 'Designation:');
        jspdf.text(70, start + head, this.designations.find(a => a.code === user.role).description);
        head += 10;

        jspdf.text(20, start + head, 'Date:');
        jspdf.text(70, start + head, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));
        head += 10;

        jspdf.text(20, start + head, 'Time:');
        jspdf.text(70, start + head, this.pipe.transform(report.dateCreated, 'HH:mm'));
        head += 10;

        jspdf.text(20, start + head, 'Serial No. In Occurrence Book:');
        head += 10;

        jspdf.text(20, start + head, 'Signature:');
        head += 20;

        jspdf.text(20, start + head, 'Management Informed');
        head += 10;

        jspdf.text(20, start + head, 'OM / OE Name:');
        head += 10;

        jspdf.text(20, start + head, 'Date:');
        head += 10;

        jspdf.text(20, start + head, 'Time:');
        head += 10;

        jspdf.text(20, start + head, 'Signature:');
    }

    protected fileName() {
        return 'lost-and-found';
    }

    updateDate(value: string) {
        this.report.dateTime = this.considerTimezone(`${value}T${this.clientTime(this.report.dateTime)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.dateTime = this.considerTimezone(`${this.clientDate(this.report.dateTime)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, dateTime, location, informant, contactNo, items
        } = this.report;

        this.updateReport({
            _id, siteId, dateTime, location, informant, contactNo, items
        });
    }
}
