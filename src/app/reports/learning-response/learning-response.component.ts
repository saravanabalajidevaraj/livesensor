import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { BaseReportComponent } from '../base-report/base-report.component';
import { ELearning, ELearningResponse } from '../../_models';
import {
    AlertService, ReportService, TransferService, EventService, NotificationService, ELearningService
} from '../../_services';

@Component({
    selector: 'app-learning-response',
    templateUrl: './learning-response.component.html'
})
export class ELRComponent extends BaseReportComponent<ELearningResponse> {
    public eLearning: ELearning;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected eventService: EventService,
                protected notificationSerice: NotificationService,
                protected eLearningService: ELearningService) {
        super(router, route, alertService, progress, reportService, eventService, notificationSerice);
    }

    ngOnInit() {
        this.url = '/eLearningResponse';

        this.route.params.subscribe(paramMap => {
            const { eLearningId, noteId, reportId } = paramMap;

            if (reportId) {
                this.showProgress();
                this.isSearch = false;
                this.isEdit = false;

                Observable.forkJoin([
                    this.eLearningService.getLearning(eLearningId),
                    this.reportService.getReport<ELearningResponse>(this.url + '/' + reportId)
                ]).subscribe(data => {
                    this.hideProgress();
                    this.eLearning = data[0];
                    this.report = data[1];
                    if (noteId) {
                        this.noteId = noteId
                        this.isApprove = true;
                    }
                }, data => {
                    this.failure(data);

                    this.isSearch = true;
                    this.eLearningService.getLearning(eLearningId).subscribe(data => {
                        this.hideProgress();
                        this.eLearning = data;
                    }, data => {
                        this.hideProgress();
                        this.failure(data);
                    });
                });
            } else {
                this.showProgress();
                this.eLearningService.getLearning(eLearningId).subscribe(data => {
                    this.hideProgress();
                    this.eLearning = data;
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                });
            }
        });
    }

    viewSearch() {
        this.isSearch = true;
        this.report = undefined;
        this.isEdit = false;
        this.isApprove = false;
        scroll(0, 0);
    }
}
