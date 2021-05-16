import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { NgxSpinnerService } from 'ngx-spinner';

import { ReportComponent } from '../../base-report/report/report.component';
import { ELearning, ELearningResponse, SubjectiveQuestion, ObjectiveQuestion, User } from '../../../_models';
import {
    AlertService, SiteService, UserService, ReportService, ImageService, ELearningService, DownloadService, UtilService
} from '../../../_services';

@Component({
    selector: 'app-elr-report',
    templateUrl: './report.component.html'
})
export class ELRReportComponent extends ReportComponent<ELearningResponse> {
    @Input('eLearning') public eLearning: ELearning;

    public resultError: string = '';

    public users: Map<string, User>;

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected eLearningService: ELearningService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    private validateResult() {
        this.resultError = '';

        if (this.report.isFailed === undefined) this.report.isFailed = false;

        const results = String(this.report.results).trim();
        if (results === '' || results === 'undefined' || results === 'null') {
            this.resultError = 'Provide evaluation for submission';
            return false;
        }
        return true;
    }

    private evaluateELearning(callback: Function = () => {}) {
        if (!this.validateResult()) return;

        this.eLearningService.evaluateLearning(this.report._id, String(this.report.results), this.report.isFailed).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                callback();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    submit() {
        this.evaluateELearning(() => {
            this.back();
            this.triggerRefresh.emit();
        });
    }

    approve() {
        this.evaluateELearning(() => super.approve());
    }
}
