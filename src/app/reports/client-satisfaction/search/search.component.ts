import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { ClientSatisfaction } from '../../../_models';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, DownloadService, ClientSatisfactoryService
} from '../../../_services';

@Component({
    selector: 'app-cs-search',
    templateUrl: './search.component.html'
})
export class CSSearchComponent extends SearchComponent<ClientSatisfaction> {
    @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;

    public scores: Map<string, number> = new Map([
        ['Excellent', 3], ['Good', 2], ['Average', 1]
    ]);

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected clientSatisfactoryService: ClientSatisfactoryService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    protected excelFormatter(worksheet: WorkSheet, report: ClientSatisfaction, index: number) {
        const values = [
            ['S/No', index + 1],
            ['Site', this.siteName(report.siteId)],
            ['User', this.userName(report.userId)],
            ['Date', this.pipe.transform(report.dateCreated, 'dd/MM/yyyy')],
            ['Time', this.pipe.transform(report.dateCreated, 'HH:mm')],

            ...report.comments.map((a, i) => [i ? undefined : 'Comments', a])
        ];

        let endColumn = 'B';

        report.itemData.forEach((a, i) => {
            if (a.note) {
                values.push([a.item, a.selection, a.note]);
                endColumn = 'C';
            } else values.push([a.item, a.selection]);
        });

        if (index < this.reports.length - 1) values.push(['', '']);

        const range = worksheet['!ref'].split(':');
        let start = range.length === 1 ? 0 : Number(range[1].slice(1));
        let end = start;
        values.forEach((a, i) => {
            worksheet[`A${++end}`] = {t: 's', v: String(a[0])};
            worksheet[`B${end}`] = {t: 's', v: String(a[1])};
            if (a[2]) worksheet[`C${end}`] = {t: 's', v: String(a[2])};
        });

        worksheet['!ref'] = `A1:${endColumn}${end}`;
        worksheet['!merges'] = worksheet['!merges'] || [];

        start += 5;

        if (report.comments.length) {
            worksheet['!merges'].push({ s: { r: start, c: 0 }, e: { r: start + report.comments.length - 1, c: 0 } });
        }
    }

    protected pdfFormatter(jspdf: jsPDF, report: ClientSatisfaction, index: number, start: number) {
        jspdf.text(20, start + 20, 'DateTime:');
        jspdf.text(70, start + 20, this.pipe.transform(report.dateCreated, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(report.dateCreated, 'HH:mm'));

        jspdf.text(20, start + 30, 'Site:');
        jspdf.text(70, start + 30, this.siteName(report.siteId));

        jspdf.text(20, start + 40, 'User:');
        jspdf.text(70, start + 40, this.userName(report.userId));

        const comments = report.comments;
        let head = 50, skipAhead = 0;
        if (comments.length) {
            jspdf.text(20, start + head, 'Comments:');
            head += 10;

            let pullBack = 0;
            comments.forEach((a, i) => {
                const commentLines = jspdf.splitTextToSize(a, jspdf.internal.pageSize.width - 61);
                if (start + head + (i - pullBack) * 10 + (skipAhead + commentLines.length - 1) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    pullBack = i;
                    start = 0;
                    head = 20;
                }
                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, commentLines);
                skipAhead += commentLines.length - 1;
            });
            head += (comments.length - pullBack) * 10;
        }

        const array = report.itemData || [];
        if (array.length) {
            jspdf.text(20, start + head + skipAhead * 6.5, 'Details:');
            head += 10;

            let pullBack = 0;
            array.forEach((a, i) => {
                const itemLines = jspdf.splitTextToSize(a.item, jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 71);
                const noteLines = jspdf.splitTextToSize(a.note, jspdf.internal.pageSize.width - 61);
                if (start + head + 20 + (i - pullBack) * 10 + (skipAhead + itemLines.length + noteLines.length - 2) * 6.5 > jspdf.internal.pageSize.height) {
                    jspdf.addPage();
                    skipAhead = 0;
                    start = 0;
                    pullBack = i;
                    head = 20;
                }

                jspdf.text(40, start + head + (i - pullBack) * 10 + skipAhead * 6.5, itemLines);
                jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(a.selection) * 5 - 20,
                    start + head + (i - pullBack) * 10 + skipAhead * 6.5, a.selection);
                skipAhead += itemLines.length - 1;

                if (a.note) {
                    jspdf.text(40, start + head + 10 + (i - pullBack) * 10 + skipAhead * 6.5, noteLines);
                    skipAhead += noteLines.length - 1;
                    head += 10;
                }
            });
        }
        if (index < this.reports.length - 1) jspdf.addPage();
    }

    protected fileName() {
        return 'client-satisfaction';
    }

    score(report: ClientSatisfaction) {
        return report.itemData && report.itemData.map(a => this.scores.get(a.selection)).reduce((a, b) => a + b, 0) || 'N/A';
    }

    selectDoc(index: number) {
        this.fileInputs.toArray()[index].nativeElement.click();
    }

    downloadDoc(fileId: string) {
        this.showProgress();
        this.downloadService.download(fileId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    uploadDoc(id: string, doc: Blob) {
        if (!doc) return;

        const formData = new FormData();
        formData.append('_id', id);
        formData.append('document', doc);

        this.showProgress();
        this.clientSatisfactoryService.uploadReport(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.triggerFetch();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data.message);
        });
    }
}
