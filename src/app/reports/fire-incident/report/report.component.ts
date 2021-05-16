import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf';

import { ReportComponent } from '../../base-report/report/report.component';
import { FireIncident, User } from '../../../_models';

@Component({
    selector: 'app-fi-report',
    templateUrl: './report.component.html'
})
export class FIReportComponent extends ReportComponent<FireIncident> {
    public types: Array<string> = ['Fire Drill', 'Fire Incidents'];

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

    protected pdfFormatter(jspdf: jsPDF, report: FireIncident, start: number, images: Array<string>) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.incidentDateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.incidentDateTime, 'HH:mm') + ' - ' +
            this.pipe.transform(report.drillEndTime, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        jspdf.text(20, start + 50, 'Incident Type:');
        jspdf.text(70, start + 50, report.incidentType);

        jspdf.text(20, start + 60, 'Block/Floor/Zone:');
        jspdf.text(70, start + 60, report.blockFloorZone);

        jspdf.text(20, start + 70, 'Location:');
        jspdf.text(70, start + 70, report.location);

        jspdf.text(20, start + 80, 'Cause:');
        jspdf.text(70, start + 80, report.cause);

        jspdf.text(20, start + 90, 'Officers Count:');
        jspdf.text(70, start + 90, String(report.involvedSOCount));
        let head = 100;

        const remarkLines = jspdf.splitTextToSize(report.remarks, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (remarkLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            head = 20;
        }
        jspdf.text(20, start + head, 'Remarks:');
        jspdf.text(40, start + head + 10, remarkLines);
        let skipAhead = remarkLines.length - 1;
        head += 20;

        const descLines = jspdf.splitTextToSize(report.fullDescription, jspdf.internal.pageSize.width - 61);
        if (start + head + 10 + (skipAhead + descLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Description:');
        jspdf.text(40, start + head + 10 + skipAhead * 6.5, descLines);
        skipAhead += descLines.length - 1;
        head += 20;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Security Manager:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.securityStaff));
        head += 10;

        if (start + head + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
            jspdf.addPage();
            start = 0;
            skipAhead = 0;
            head = 20;
        }
        jspdf.text(20, start + head + skipAhead * 6.5, 'Estates/Manager:');
        jspdf.text(70, start + head + skipAhead * 6.5, this.userName(report.managementStaff));
        head += 10;

        const array = report.response.data;
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
                const response = a.response ? 'Yes' : 'No';

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.question);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(response) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, response);
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

        jspdf.text(20, start + head + skipAhead * 6.5, 'Received By:');
        head += 10;

        jspdf.text(20, start + head + skipAhead * 6.5, 'Copy To: Fire Safety Mgr / Dir / Security / Client');
    }

    protected fileName() {
        return 'fire-incident';
    }

    block() {
        return this.report.blockFloorZone.split('/')[0].trim();
    }

    floor() {
        return this.report.blockFloorZone.split('/')[1].trim();
    }

    zone() {
        return this.report.blockFloorZone.split('/')[2].trim();
    }

    updateIncidentType(value: string) {
        this.report.incidentType = value;
    }

    updateBlock(value: string) {
        if (value === '') value = ' ';
        this.report.blockFloorZone = `${value}/${this.floor()}/${this.zone()}`
    }

    updateFloor(value: string) {
        if (value === '') value = ' ';
        this.report.blockFloorZone = `${this.block()}/${value}/${this.zone()}`
    }

    updateZone(value: string) {
        if (value === '') value = ' ';
        this.report.blockFloorZone = `${this.block()}/${this.floor()}/${value}`
    }

    updateDate(value: string) {
        this.report.incidentDateTime = this.considerTimezone(`${value}T${this.clientTime(this.report.incidentDateTime)}:00.000Z`);
        this.report.drillEndTime = this.considerTimezone(`${value}T${this.clientTime(this.report.drillEndTime)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.incidentDateTime = this.considerTimezone(`${this.clientDate(this.report.incidentDateTime)}T${value}:00.000Z`);
    }

    updateEndTime(value: string) {
        this.report.drillEndTime = this.considerTimezone(`${this.clientDate(this.report.incidentDateTime)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, incidentType, incidentDateTime, blockFloorZone,
            location, cause, remarks, fullDescription, drillEndTime,
            securityStaff, managementStaff, involvedSOCount, response
        } = this.report;

        this.updateReport({
            _id, siteId, incidentType, incidentDateTime, blockFloorZone,
            location, cause, remarks, fullDescription, drillEndTime,
            securityStaff, managementStaff, involvedSOCount, response
        });
    }
}
