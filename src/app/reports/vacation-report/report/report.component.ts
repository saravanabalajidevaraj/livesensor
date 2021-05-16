import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { ReportComponent } from '../../base-report/report/report.component';
import {
    AlertService, SiteService, UserService, ReportService, ImageService, DownloadService, UtilService, VacationService
} from '../../../_services';
import { VacationReport, User } from '../../../_models';

@Component({
    selector: 'app-vr-report',
    templateUrl: './report.component.html'
})
export class VReportComponent extends ReportComponent<VacationReport> {
    private vacationTypes: Map<string, string> = new Map<string, string>();
    public doc: any;

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected vacationService: VacationService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.vacationService.vacationTypes().subscribe(data => {
            this.vacationTypes = data.reduce((acc, type) => {
                acc.set(type.code, type.description);
                return acc;
            }, new Map<string, string>())
        })
    }

    fromDate() {
        return this.report.fromDate.slice(0, 10);
    }

    toDate() {
        return this.report.toDate.slice(0, 10);
    }

    getDuration() {
        return this.utilService.daysWithOneDayWeekend(new Date(this.report.fromDate), new Date(this.report.toDate));
    }

    downloadDoc() {
        this.showProgress();
        this.downloadService.download(this.report.fileId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    updateDocument(doc: any) {
        this.doc = doc;
    }

    vacationType() {
        return this.vacationTypes.get(this.report.leaveTypeCode) || 'N/A';
    }

    updateFrom(from: string) {
        this.report.fromDate = new Date(from).toISOString();
        this.updateDuration(this.getDuration());
    }

    updateTo(to: string) {
        this.report.toDate = new Date(to).toISOString();
        this.updateDuration(this.getDuration());
    }

    updateDuration(duration: number) {
        this.report.duration = duration;
    }

    updateComments(comments: string) {
        this.report.comments = comments;
    }

    submit() {
        const {
            _id, comments, duration, employeeId, fromDate, toDate
        } = this.report;

        const formData = new FormData();
        formData.append('_id', _id);
        formData.append('comments', comments);
        formData.append('duration', String(duration));
        formData.append('employeeId', employeeId);
        formData.append('fromDate', fromDate);
        formData.append('toDate', toDate);
        if (this.doc) formData.append('document', this.doc);

        this.showProgress();
        this.reportService.updateReport(this.url + '/update', formData).subscribe(data => {
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
}
