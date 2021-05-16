import { Component } from '@angular/core';
import * as jsPDF from 'jspdf'

import { ReportComponent } from '../../base-report/report/report.component';
import { OfficerFeedback } from '../../../_models';

@Component({
    selector: 'app-of-report',
    templateUrl: './report.component.html'
})
export class OFReportComponent extends ReportComponent<OfficerFeedback> {

    exportAsPdf() {
        const report = this.report;
        this.downloadService.exportAsPdf(this.fileName(), jspdf => {
            let head = 0;
            const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
            jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, 10, imageWidth, imageHeight);
            head += 50;

            const heading = this.reportName();
            jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, head + 10, heading);
            head += 30;

            if (head + 10 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
            }

            jspdf.text(20, head, 'DateTime:');
            jspdf.text(70, head, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy') +
                ' ' + this.pipe.transform(report.dateCreated, 'HH:mm'));
            head += 10;

            if (head + 10 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
            }

            jspdf.text(20, head, 'Site:');
            jspdf.text(70, head, this.siteName(report.siteId));
            head += 10;

            if (head + 10 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
            }

            jspdf.text(20, head, 'Officer:');
            jspdf.text(70, head, this.userName(report.userId));
            head += 10;

            if (head + 10 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
            }
            jspdf.text(20, head, 'Contact No:');
            jspdf.text(70, head, report.contactNo);
            head += 10;

            const commentLines = jspdf.splitTextToSize(report.comments, jspdf.internal.pageSize.width - 61);
            if (head + 10 + (commentLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                head = 20;
            }
            jspdf.text(20, head, 'Comments:');
            jspdf.text(40, head + 10, commentLines);
            let skipAhead = commentLines.length - 1;
            head += 20;

            jspdf.line(10, head + skipAhead * 6.5, jspdf.internal.pageSize.width - 10, head + skipAhead * 6.5);
            head += 20;

            if (head + 60 + skipAhead * 6.5 > jspdf.internal.pageSize.height) {
                jspdf.addPage();
                skipAhead = 0;
                head = 20;
            }

            jspdf.text(20, head + skipAhead * 6.5, 'Particulars of Reporting Officer');
            head += 10;

            jspdf.text(20, head + skipAhead * 6.5, 'Name of Officer');
            jspdf.text(70, head + skipAhead * 6.5, this.userName(report.userId));
            head += 10;

            jspdf.text(20, head + skipAhead * 6.5, 'Site:');
            jspdf.text(70, head + skipAhead * 6.5, this.siteName(report.siteId));
            head += 10;

            jspdf.text(20, head + skipAhead * 6.5, 'Date:');
            jspdf.text(70, head + skipAhead * 6.5, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy'));
            head += 10;

            jspdf.text(20, head + skipAhead * 6.5, 'Contact No:');
            jspdf.text(70, head + skipAhead * 6.5, String(this.users.get(report.userId).phone || ''));
            head += 10;

            jspdf.text(20, head + skipAhead * 6.5, 'Signature:');
        });
    }

    protected fileName() {
        return 'officer-feedback';
    }
}
