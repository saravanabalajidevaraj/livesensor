import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { SearchComponent } from './search/search.component';
import { AlertService, ReportService, TransferService, EventService, NotificationService } from '../../_services';

@Component({
    template: '<div></div>'
})
export class BaseReportComponent<E> implements OnInit {
    @ViewChild('reportSearch') reportSearch: SearchComponent<E>;

    public report: E;

    public url: string = '';
    public isSearch: boolean = true;
    public isEdit: boolean = false;
    public isApprove: boolean = false;

    protected noteId: string = '';

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected eventService: EventService,
                protected notificationSerice: NotificationService) { }

    ngOnInit() {
        this.route.params.subscribe(paramMap => {
            const { noteId, reportId } = paramMap;
            if (reportId) {
                this.showProgress();
                this.isSearch = false;
                this.isEdit = false;

                this.reportService.getReport<E>(this.url + '/' + reportId).subscribe(data => {
                    this.hideProgress();
                    this.report = data;
                    if (noteId) {
                        this.noteId = noteId
                        this.isApprove = true;
                    }
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                    this.isSearch = true;
                });
            }
        });
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

    editReport() {
        this.isEdit = true;
    }

    viewReport({report, isEdit}) {
        this.isSearch = false;
        this.report = report;
        this.isEdit = isEdit;
        this.isApprove = false;
        scroll(0, 0);
    }

    viewSearch() {
        this.router.navigate([this.route.snapshot.url[0].path]);
        this.isSearch = true;
        this.report = undefined;
        this.isEdit = false;
        this.isApprove = false;
        scroll(0, 0);
    }

    triggerFetch() {
        this.reportSearch.triggerFetch();
    }

    approveReport() {
        this.showProgress();
        this.notificationSerice.approve(this.noteId).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.viewSearch();
                this.triggerFetch();
                this.eventService.triggerHeaderRefresh();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
