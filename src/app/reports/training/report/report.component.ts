import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { ReportComponent } from '../../base-report/report/report.component';
import { User, Training } from '../../../_models';
import {
    AlertService, SiteService, UserService, ReportService, ImageService, TrainingService, DownloadService, UtilService
} from '../../../_services';

@Component({
    selector: 'app-tr-report',
    templateUrl: './report.component.html'
})
export class TRReportComponent extends ReportComponent<Training> {

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected trainingService: TrainingService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    date() {
        return this.clientDate(this.report.fromDate);
    }

    updateDate(value: string) {
        this.report.fromDate = this.considerTimezone(`${value}T${this.fromTime()}:00.000Z`);
        this.report.toDate = this.considerTimezone(`${value}T${this.toTime()}:00.000Z`);
    }

    fromTime() {
        return this.clientTime(this.report.fromDate);
    }

    updateFromTime(value: string) {
        this.report.fromDate = this.considerTimezone(`${this.date()}T${value}:00.000Z`);
    }

    toTime() {
        return this.clientTime(this.report.toDate);
    }

    updateToTime(value: string) {
        this.report.toDate = this.considerTimezone(`${this.date()}T${value}:00.000Z`);
    }

    submit() {

    }
}
