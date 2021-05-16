import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import * as jsPDF from 'jspdf'

import { User, Site, Designation } from '../../../_models';
import { AlertService, SiteService, UserService, ReportService, ImageService, DownloadService, UtilService } from '../../../_services';

@Component({
    template: '<div></div>'
})
export class ReportComponent<E> implements OnInit {
    @Output() openSearch = new EventEmitter();
    @Output() editReport = new EventEmitter();
    @Output() approveReport = new EventEmitter();
    @Output() triggerRefresh = new EventEmitter();

    @Input() report: E;
    @Input() isEdit: boolean;
    @Input() isApprove: boolean;
    @Input() url: string;

    protected logoRatio = 354 / 163;
    protected logo: string;

    public pipe: DatePipe = new DatePipe('en-US');

    public sites: Map<string, Site> = new Map<string, Site>();
    public users: Map<string, User> = new Map<string, User>();
    public images: Map<string, Object> = new Map<string, Object>();
    protected designations: Array<Designation> = [];

    public searchUsers = (value: Observable<string>) => {
        var users = Array.from(this.users).map(a => a[1]).map(a => `${a.firstName} ${a.lastName} - ${a.userName}`);
        return value.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(text => users.filter(a => a.indexOf(text) != -1).slice(0, 5)));
    }

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService) {
    }

    ngOnInit() {
        this.siteService.getNames().subscribe(data => this.sites = data, data => this.failure(data));
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.userService.designations().subscribe(data => this.designations = data, data => this.failure(data));

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

    exportAsPdf() {
        this.exportPdf([]);
    }

    protected exportPdf(images: Array<string>) {
        this.downloadService.exportAsPdf(this.fileName(), jspdf => {
            let head = 10;
            const imageHeight = 40, imageWidth = imageHeight * this.logoRatio;
            jspdf.addImage(this.logo, 'JPEG', (jspdf.internal.pageSize.width - imageWidth) / 2, head, imageWidth, imageHeight);
            head += imageHeight + 10;

            const heading = this.reportName();
            jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, head, heading);
            const label = this.rightHeadingLabel();
            jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(label) * 5 - 20, 60, label);

            this.pdfFormatter(jspdf, this.report, head, images);
        });
    }

    protected pdfFormatter(jspdf: jsPDF, report: E, head: number, images: Array<string>) { }

    protected reportName() {
        return this.fileName().split('-').map(a => a[0].toUpperCase() + a.slice(1, a.length)).join(' ');
    }

    protected rightHeadingLabel() {
        return '';
    }

    protected fileName() {
        return 'report';
    }

    clientDate(dateString: string) {
        return this.utilService.dateStringIgnoreTimezone(new Date(dateString)).slice(0, 10);
    }

    clientTime(dateString: string) {
        return this.utilService.dateStringIgnoreTimezone(new Date(dateString)).slice(11, 16);
    }

    protected considerTimezone(dateTime: string) {
        const date = new Date(dateTime);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toISOString();
    }

    userName(userId: string) {
        var user: User = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    siteName(siteId: string) {
        var site: Site = this.sites.get(siteId);
        return site && site.siteName || 'N/A';
    }

    imageFor(imageId: string) {
        return this.images.get(imageId) || 'assets/img/ic_cloud_download.png';
    }

    parseImage(imageId: string) {
        if (this.images.has(imageId)) return;

        this.images.set(imageId, 'assets/img/ic_progress_clock.png');
        this.imageService.imageById(imageId).subscribe(data => this.images.set(imageId, data), data => {
            this.images.delete(imageId);
            this.failure(data);
        });
    }

    searchUser(value: string) {
        return Array.from(this.users || []).map(a => a[1])
            .filter(a => `${a.firstName} ${a.lastName} - ${a.userName}` === value)[0];
    }

    edit() {
        this.editReport.emit();
    }

    back() {
        this.openSearch.emit();
    }

    updateReport(payload: any) {
        this.showProgress();
        this.reportService.updateReport(this.url + '/update', payload).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.back();
                this.triggerRefresh.emit();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    approve() {
        this.approveReport.emit();
    }
}
