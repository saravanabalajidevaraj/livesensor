import { Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf';

import { Site, User } from '../../../_models';
import { AlertService, ReportService, SiteService, UserService, UtilService, DownloadService } from '../../../_services';

@Component({
    template: '<div></div>'
})
export class SearchComponent<E> implements OnInit {
    @Output() reportSelect = new EventEmitter<{report: E, isEdit: boolean}>();

    @Input() url: string;

    @ViewChild('search') search: ElementRef;

    protected logoRatio = 354 / 163;
    protected logo: string;

    public siteError: string = '';
    public timeError: string = '';

    public pipe: DatePipe = new DatePipe('en-US');
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public sites: Map<string, Site> = new Map<string, Site>();
    public users: Map<string, User> = new Map<string, User>();
    public userIds: Array<string> = [];
    public reports: Array<E> = [];
    public delete: Array<boolean> = [];

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService) { }

    ngOnInit() {
        this.siteService.getAll().subscribe(data => {
            this.sites = data.reduce((acc, a) => {
                acc.set(a._id, a);
                return acc;
            }, new Map<string, Site>());
        }, data => this.failure(data));
        this.userService.getAll().subscribe(data => {
            this.users = data;

            const usersSorted = Array.from(data).map(a => a[0]);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.userIds = usersSorted;
        }, data => this.failure(data));

        const reader = new FileReader();
        reader.onload = () => this.logo = reader.result;
        this.downloadService.local('../../../assets/img/lssLogo.jpg')
            .subscribe(data => reader.readAsDataURL(data), data => this.failure(data));
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    success(message: string) {
        this.alertService.success(message);
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    triggerFetch() {
        this.search.nativeElement.click();
    }

    exportAsExcel() {
        this.downloadService.exportAsExcel(this.fileName(), worksheet => {
            worksheet['A1'] = {t: 's', v: this.reportName()};
            worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
            worksheet['!ref'] = 'A1:B2';
            this.reports.forEach((report, i) => this.excelFormatter(worksheet, report, i));
        });
    }

    exportAsExcelOld() {
        const columns = [
            '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];

        const columnName = number => {
            let name = '';
            while (number != 0) {
                name += columns[number % columns.length];
                number = Number((number / columns.length).toFixed(0));
            }
            return name;
        };

        this.downloadService.exportAsExcel(this.fileName(), (worksheet: WorkSheet) => {
            const array = this.reports.map((a, i) => this.parseReport(a, i));
            const headers = Object.keys(array[0]);

            headers.forEach((a, i) => worksheet[`${columnName(i + 1)}3`] = {t: 's', v: a});
            array.forEach((a, i) => Object.keys(a).forEach((b, j) => worksheet[`${columnName(j + 1)}${i + 4}`] = {t: 's', v: a[b]}));

            worksheet['A1'] = {t: 's', v: this.reportName()};
            worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
            worksheet['!ref'] = `A1:${columnName(headers.length)}${array.length + 3}`;
        });
    }

    exportAsPdf() {
        this.downloadService.exportAsPdf(this.fileName(), jspdf => {
            this.reports.forEach((report, i) => {
                let head = 0;
                if (i === 0) {
                    const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
                    jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, 10, imageWidth, imageHeight);
                    head += 50;

                    const heading = this.reportName();
                    jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, head + 10, heading);
                    head += 10;
                }
                this.pdfFormatter(jspdf, report, i, head);
            });
        });
    }

    exportAsPdfOld() {
        this.downloadService.exportAsPdf(this.fileName(), (jspdf: jsPDF) => {
            const array = this.reports.map((a, i) => this.parseReport(a, i));
            const headers = Object.keys(array[0] || {}).reduce((acc, a) => { acc[a] = a; return acc; }, {});
            jspdf.autoTable({
                head: [headers],
                body: array,
                showHead: 'firstPage',
                margin: {top: this.rightHeadingLabel() ? 80 : 70},
                didDrawPage: data => {
                    if (data.pageCount === 1) {
                        const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
                        jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, 10, imageWidth, imageHeight);

                        const heading = this.reportName();
                        jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, 60, heading);
                        const label = this.rightHeadingLabel();
                        jspdf.setTextColor(255, 165, 0);
                        jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(label) * 5) / 2, 70, label);
                        jspdf.setTextColor(255,0,0);
                        data.settings.margin.top = 10;
                    }
                }
            });
        }, 'l');
    }

    protected rightHeadingLabel() {
        return '';
    }

    protected parseReport(report: E, index: number) {
        return {};
    }

    protected excelFormatter(worksheet: WorkSheet, report: E, index: number) { }

    protected pdfFormatter(jspdf: jsPDF, report: E, index: number, head: number) { }

    protected reportName() {
        return this.fileName().split('-').map(a => a[0].toUpperCase() + a.slice(1, a.length)).join(' ');
    }

    protected fileName() {
        return 'report';
    }

    validate(from: Date, to: Date, payload: any) {
        this.siteError = '';
        this.timeError = '';

        if (!this.sites.has(payload.siteId)) {
            this.siteError = 'Select a valid site';
            return false;
        }

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        return true;
    }

    fetchReports(from: string, to: string, payload: any) {
        const fromDate = new Date(from);

        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        if (!this.validate(fromDate, toDate, payload)) return;

        payload.fromDate = fromDate.toISOString();
        payload.toDate = toDate.toISOString();

        this.reports = [];
        this.showProgress();
        this.reportService.getReports<E>(this.url + '/report', payload).subscribe(data => {
            this.reports = data;
            this.delete = new Array(data.length).fill(false);
            this.hideProgress();
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    clone(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    openReport(report: E, isEdit: boolean) {
        this.reportSelect.emit({report: this.clone(report), isEdit});
    }

    deleteReport(id: string) {
        this.showProgress();
        this.reportService.deleteReport(this.url + '/delete', id).subscribe(data => {
            this.success(data.description);
            this.hideProgress();
            this.triggerFetch();
        }, data => {
            this.failure(data);
            this.hideProgress();
        });
    }

    userName(userId: string) {
        const user: User = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    siteName(siteId: string) {
        const site: Site = this.sites.get(siteId);
        return site && site.siteName || 'N/A';
    }
}
