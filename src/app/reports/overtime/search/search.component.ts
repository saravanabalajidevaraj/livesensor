import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, AttendanceService,
    DownloadService
} from '../../../_services';
import { AttendanceReport, Notification } from '../../../_models';

@Component({
    selector: 'app-ot-search',
    templateUrl: './search.component.html'
})
export class OTSearchComponent extends SearchComponent<Notification> {

    public siteId: string = '';

    private attendance: Array<AttendanceReport> = [];

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected attendanceService: AttendanceService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    fetchNotifications(siteId: string) {
        const toDate = new Date(this.today);

        const fromDate = new Date(toDate.getTime());
        fromDate.setMonth(fromDate.getMonth() - 6);

        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        const payload: any = {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
        };
        if (siteId) payload.siteId = siteId;

        this.reports = [];
        this.attendance = [];
        this.showProgress();
        this.reportService.getReports<Notification>(this.url + '/report', payload).subscribe(data => {
            if (data.length === 0) {
                this.hideProgress();
                this.siteId = siteId;
                return;
            }
            Observable.forkJoin(data.map(({id}) => this.attendanceService.getReport(id))).subscribe(attendance => {
                this.hideProgress();
                this.reports = data;
                this.attendance = attendance;
                this.siteId = siteId;
            }, data => {
                this.hideProgress();
                this.failure(data);
            });
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
